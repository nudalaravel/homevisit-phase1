<?php
/**
 * PHP Proxy API
 * แทนที่ Nuxt.js proxy เพื่อ bypass CORS และ forward requests ไปยัง API server
 * 
 * Usage: /api/* -> https://ripedresearch.org/*
 */

// ตั้งค่า error reporting (ปิดใน production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// ตั้งค่า timezone
date_default_timezone_set('Asia/Bangkok');

// ตั้งค่า timeout
set_time_limit(60);
ini_set('default_socket_timeout', 30);

// รับค่า configuration จาก environment variables หรือใช้ค่า default
$PROXY_TARGET = getenv('PROXY_TARGET') ?: 'https://ripedresearch.org';
$ALLOWED_ORIGINS = getenv('ALLOWED_ORIGINS') ?: '*';
$ENABLE_LOGGING = getenv('ENABLE_LOGGING') === 'true' ? true : false;

/**
 * Log function (optional)
 */
function logMessage($message) {
    global $ENABLE_LOGGING;
    if ($ENABLE_LOGGING) {
        $logFile = __DIR__ . '/proxy.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
    }
}

/**
 * Get request path (ลบ /api prefix)
 */
function getRequestPath() {
    // ตรวจสอบ PATH_INFO ก่อน (เมื่อเรียกผ่าน rewrite rule)
    if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
        $path = $_SERVER['PATH_INFO'];
    } else {
        // ใช้ REQUEST_URI
        $requestUri = $_SERVER['REQUEST_URI'];
        $path = parse_url($requestUri, PHP_URL_PATH);
        
        // ลบ /api prefix
        if (strpos($path, '/api/') === 0) {
            $path = substr($path, 4); // ลบ '/api'
        } elseif ($path === '/api' || $path === '/api/') {
            $path = '/';
        }
        
        // ถ้า path เป็น /api/proxy.php หรือ /proxy.php ให้เป็น '/'
        if (strpos($path, '/proxy.php') !== false) {
            $path = '/';
        }
    }
    
    // ถ้า path เป็น empty หรือไม่ได้ขึ้นต้นด้วย / ให้เป็น '/'
    if (empty($path) || $path[0] !== '/') {
        $path = '/' . ltrim($path, '/');
    }
    
    return $path;
}

/**
 * Get query string
 */
function getQueryString() {
    return isset($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : '';
}

/**
 * Build target URL
 */
function buildTargetUrl($target, $path, $queryString) {
    $url = rtrim($target, '/') . $path;
    
    if (!empty($queryString)) {
        $url .= '?' . $queryString;
    }
    
    return $url;
}

/**
 * Forward headers from client request
 */
function getForwardHeaders() {
    $headers = [];
    
    // Forward important headers
    $headerMap = [
        'Content-Type' => 'CONTENT_TYPE',
        'Content-Length' => 'CONTENT_LENGTH',
        'Authorization' => 'HTTP_AUTHORIZATION',
        'Accept' => 'HTTP_ACCEPT',
        'Accept-Language' => 'HTTP_ACCEPT_LANGUAGE',
        'Accept-Encoding' => 'HTTP_ACCEPT_ENCODING',
        'User-Agent' => 'HTTP_USER_AGENT',
        'X-Requested-With' => 'HTTP_X_REQUESTED_WITH',
    ];
    
    foreach ($headerMap as $headerName => $serverKey) {
        if (isset($_SERVER[$serverKey]) && !empty($_SERVER[$serverKey])) {
            $headers[$headerName] = $_SERVER[$serverKey];
        }
    }
    
    // Forward cookies
    if (!empty($_COOKIE)) {
        $cookieStrings = [];
        foreach ($_COOKIE as $name => $value) {
            $cookieStrings[] = "$name=$value";
        }
        if (!empty($cookieStrings)) {
            $headers['Cookie'] = implode('; ', $cookieStrings);
        }
    }
    
    // Set Origin และ Referer เพื่อ bypass CORS
    global $PROXY_TARGET;
    $headers['Origin'] = $PROXY_TARGET;
    $headers['Referer'] = $PROXY_TARGET . '/';
    
    // Connection keep-alive
    $headers['Connection'] = 'keep-alive';
    
    return $headers;
}

/**
 * Get request body
 */
function getRequestBody() {
    return file_get_contents('php://input');
}

/**
 * Proxy request to target server
 */
function proxyRequest($url, $method, $headers, $body = null) {
    $ch = curl_init();
    
    // สร้าง headers array สำหรับ CURL
    $curlHeaders = [];
    foreach ($headers as $key => $value) {
        $curlHeaders[] = "$key: $value";
    }
    
    // ตั้งค่า CURL options
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false, // ปิดการตรวจสอบ SSL (เหมือน PROXY_SECURE=false)
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HEADER => true, // รับ headers กลับมาด้วย
        CURLOPT_HTTPHEADER => $curlHeaders,
    ]);
    
    // เพิ่ม request body สำหรับ POST, PUT, PATCH
    if (in_array($method, ['POST', 'PUT', 'PATCH']) && $body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        logMessage("CURL Error: $error");
        return [
            'success' => false,
            'error' => $error,
            'http_code' => 0
        ];
    }
    
    // แยก headers และ body
    $responseHeaders = substr($response, 0, $headerSize);
    $responseBody = substr($response, $headerSize);
    
    return [
        'success' => true,
        'http_code' => $httpCode,
        'headers' => $responseHeaders,
        'body' => $responseBody
    ];
}

/**
 * Parse and forward response headers
 */
function forwardResponseHeaders($headersString) {
    $headers = [];
    $lines = explode("\r\n", $headersString);
    
    foreach ($lines as $line) {
        if (empty($line)) continue;
        
        // Skip HTTP status line
        if (preg_match('/^HTTP\//', $line)) {
            continue;
        }
        
        // Parse header line
        if (strpos($line, ':') !== false) {
            list($key, $value) = explode(':', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Skip headers ที่ไม่ควร forward
            $skipHeaders = [
                'Connection',
                'Transfer-Encoding',
                'Content-Encoding',
                'Content-Length', // จะคำนวณใหม่
            ];
            
            if (!in_array($key, $skipHeaders)) {
                // Handle Set-Cookie (ลบ domain)
                if (strtolower($key) === 'set-cookie') {
                    // ลบ domain จาก cookie เพื่อให้ทำงาน cross-domain
                    $value = preg_replace('/;\s*domain=[^;]+/i', '', $value);
                    $value = preg_replace('/;\s*path=[^;]+/i', '', $value);
                    header("Set-Cookie: $value", false);
                } else {
                    $headers[$key] = $value;
                }
            }
        }
    }
    
    return $headers;
}

/**
 * Set CORS headers
 */
function setCorsHeaders() {
    global $ALLOWED_ORIGINS;
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
    
    if ($ALLOWED_ORIGINS === '*') {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        $allowed = explode(',', $ALLOWED_ORIGINS);
        if (in_array($origin, $allowed)) {
            header("Access-Control-Allow-Origin: $origin");
        }
    }
    
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    header('Access-Control-Max-Age: 86400');
}

/**
 * Handle OPTIONS request (CORS preflight)
 */
function handleOptionsRequest() {
    setCorsHeaders();
    http_response_code(200);
    exit;
}

/**
 * Main proxy function
 */
function main() {
    global $PROXY_TARGET;
    
    // Handle OPTIONS request (CORS preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        handleOptionsRequest();
        return;
    }
    
    // Get request details
    $method = $_SERVER['REQUEST_METHOD'];
    $path = getRequestPath();
    $queryString = getQueryString();
    $targetUrl = buildTargetUrl($PROXY_TARGET, $path, $queryString);
    
    logMessage("Proxying $method $path to $targetUrl");
    
    // Get headers and body
    $headers = getForwardHeaders();
    $body = getRequestBody();
    
    // Proxy request
    $result = proxyRequest($targetUrl, $method, $headers, $body);
    
    if (!$result['success']) {
        http_response_code(502);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Proxy error: ' . $result['error']
        ]);
        return;
    }
    
    // Set CORS headers
    setCorsHeaders();
    
    // Forward response headers
    $responseHeaders = forwardResponseHeaders($result['headers']);
    foreach ($responseHeaders as $key => $value) {
        header("$key: $value");
    }
    
    // Set HTTP status code
    http_response_code($result['http_code']);
    
    // Output response body
    echo $result['body'];
}

// Run proxy
main();

