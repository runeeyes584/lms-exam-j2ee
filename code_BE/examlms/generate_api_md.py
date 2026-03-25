import json
import os

with open('swagger.json', 'r', encoding='utf-8') as f:
    swagger = json.load(f)

md_file = open('../apiendpoint.md', 'w', encoding='utf-8')
md_file.write("# 📚 Tài Liệu Hướng Dẫn API Endpoints - Hệ Thống LMS Exam Backend\n\n")
md_file.write("Tài liệu này tổng hợp **toàn bộ** danh sách các API endpoints của hệ thống Back-end dựa trên Swagger API Docs tự động thu thập từ Server đang chạy.\n\n")
md_file.write("**Base URL:** `http://localhost:8080`\n")
md_file.write("**Authentication:** Yêu cầu JWT Token truyền trong Header `Authorization: Bearer <token>` hoặc đối với tài liệu đang test có thể cần Header `X-User-Id`.\n\n---\n\n")

paths = swagger.get('paths', {})
components = swagger.get('components', {}).get('schemas', {})

def resolve_schema(schema, depth=0):
    if depth > 4: return {}
    if not schema: return {}
    
    if '$ref' in schema:
        ref_name = schema['$ref'].split('/')[-1]
        resolved = components.get(ref_name, {})
        return resolve_schema(resolved, depth + 1)
    
    if schema.get('type') == 'object':
        props = schema.get('properties', {})
        result = {}
        for k, v in props.items():
            result[k] = resolve_schema(v, depth + 1)
        return result
        
    elif schema.get('type') == 'array':
        items = schema.get('items', {})
        return [resolve_schema(items, depth + 1)]
        
    else:
        # Default primitive values
        t = schema.get('type')
        if t == 'string':
            if schema.get('format') == 'date-time':
                return "2026-03-24T10:00:00Z"
            if 'enum' in schema:
                return schema['enum'][0]
            return "string"
        elif t == 'integer':
            return 0
        elif t == 'number':
            return 0.0
        elif t == 'boolean':
            return True
        else:
            return "any"

tags = {}

# Group paths by tags
for path, methods in paths.items():
    for method, content in methods.items():
        if method in ['get', 'post', 'put', 'delete', 'patch']:
            tag = content.get('tags', ['Untagged'])[0]
            if tag not in tags:
                tags[tag] = []
            tags[tag].append({
                'path': path,
                'method': method.upper(),
                'summary': content.get('summary', ''),
                'description': content.get('description', ''),
                'parameters': content.get('parameters', []),
                'requestBody': content.get('requestBody', {}),
                'responses': content.get('responses', {})
            })

doc_counter = 1
for tag in sorted(tags.keys()):
    endpoints = tags[tag]
    md_file.write(f"## {doc_counter}. Module: {tag}\n\n")
    endpoint_counter = 1
    for ep in endpoints:
        md_file.write(f"### {doc_counter}.{endpoint_counter} {ep['summary'] or ep['path']}\n")
        md_file.write(f"- **Endpoint:** `{ep['method']} {ep['path']}`\n")
        if ep['description']:
            md_file.write(f"- **Mô tả:** {ep['description']}\n")
        
        if ep['parameters']:
            md_file.write("- **Parameters:**\n")
            for param in ep['parameters']:
                required = "Bắt buộc" if param.get('required') else "Tùy chọn"
                md_file.write(f"  - `{param.get('name')}` ({param.get('in')}): {required} - {param.get('description', '')}\n")
        
        # Example Request Body
        if 'content' in ep['requestBody']:
            content_types = ep['requestBody']['content']
            if 'application/json' in content_types:
                schema = content_types['application/json'].get('schema', {})
                example_json = resolve_schema(schema)
                md_file.write(f"- **Request Body Example:**\n```json\n{json.dumps(example_json, indent=2, ensure_ascii=False)}\n```\n")
            elif 'multipart/form-data' in content_types:
                md_file.write("- **Request Body:** Form-Data (Upload File)\n")

        md_file.write("\n")
        endpoint_counter += 1
    md_file.write("---\n")
    doc_counter += 1

md_file.close()

print("Markdown generated successfully at ../apiendpoint.md")
