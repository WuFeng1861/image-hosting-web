# 图床服务 API 文档

## 基础信息

- 基础URL: `http://{domain}:{port}/api`
- 默认域名: `127.0.0.1`
- 默认端口: `5888`
- 内容类型: `application/json` 或 `multipart/form-data`（上传文件时）

## API 端点

### 1. 上传图片

上传一张或多张图片并获取访问链接。

- **路径**: `/images/upload`
- **方法**: `POST`
- **Content-Type**: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| files | File[] | 是 | 要上传的图片文件（最多10张） |
| serverPassword | String | 否 | 管理员密码，上传任意一张超过2MB的图片时必填 |

#### 响应示例

```json
{
  "success": true,
  "message": "上传成功",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "example.jpg",
      "originalName": "原始文件名.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "url": "http://127.0.0.1:5888/api/images/550e8400-e29b-41d4-a716-446655440000.jpg",
      "createdAt": "2023-09-01T12:00:00Z"
    }
  ]
}
```

#### 错误响应

```json
{
  "success": false,
  "message": "文件过大且管理员密码不正确",
  "error": "UNAUTHORIZED",
  "statusCode": 401
}
```

### 2. 获取所有图片

获取所有已上传图片的信息列表，支持分页。

- **路径**: `/images`
- **方法**: `GET`

#### 查询参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | Number | 否 | 页码，默认为1 |
| limit | Number | 否 | 每页数量，默认为20 |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
        "originalName": "原始文件名.jpg",
        "mimeType": "image/jpeg",
        "size": 1024000,
        "url": "http://127.0.0.1:5888/api/images/550e8400-e29b-41d4-a716-446655440000.jpg",
        "createdAt": "2023-09-01T12:00:00Z"
      }
    ],
    "meta": {
      "totalItems": 100,
      "itemCount": 20,
      "itemsPerPage": 20,
      "totalPages": 5,
      "currentPage": 1
    }
  }
}
```

### 3. 获取单个图片信息

获取指定图片的详细信息。

- **路径**: `/images/:id`
- **方法**: `GET`

#### 路径参数

| 参数名 | 类型 | 描述 |
|--------|------|------|
| id | String | 图片ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
    "originalName": "原始文件名.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "http://127.0.0.1:5888/api/images/550e8400-e29b-41d4-a716-446655440000.jpg",
    "createdAt": "2023-09-01T12:00:00Z"
  }
}
```

### 4. 访问图片

直接通过URL访问上传的图片。

- **路径**: `/images/{filename}`
- **方法**: `GET`

#### 示例URL

```
http://127.0.0.1:5888/api/images/550e8400-e29b-41d4-a716-446655440000.jpg
```

#### 缓存策略

图片设置了以下缓存头：
- `Cache-Control: public, max-age=31536000`
- `Expires: {当前时间 + 1年}`