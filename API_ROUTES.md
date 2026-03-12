# Product Inventory API Routes

Base URL: `http://localhost:5000`

## Health Route

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API server status |

## Product Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products` | Create a new product |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get one product by MongoDB `_id` |
| PUT | `/api/products/:id` | Update a product by MongoDB `_id` |
| DELETE | `/api/products/:id` | Delete a product by MongoDB `_id` |

## Notes

- `:id` refers to MongoDB document `_id`.
- API responses are JSON.
- Any undefined route returns:

```json
{
  "success": false,
  "message": "Route not found"
}
```
