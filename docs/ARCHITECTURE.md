# Backend Architecture — Refactoring Guide

## Design Decisions

### 1. **Layered Architecture**

```
Routes → Controllers → Services → Repositories (DB Models)
              ↓
        Validation (Joi)
              ↓
        Response Util
```

- **Routes**: Define HTTP verbs and paths; delegate to controllers
- **Controllers**: Handle HTTP (req/res), validation, call services
- **Services**: Business logic, orchestration, reusable across controllers
- **Repositories**: Database access (currently Mongoose models; can be abstracted later)

**Why**: Separation of concerns makes testing easier, logic reusable, and changes localized.

---

### 2. **Global Error Handler**

All async errors propagate to a single `errorHandler` middleware via `next(err)`.

- **Joi** validation errors → 400
- **Mongoose** ValidationError, CastError → 400
- **AppError** (custom) → uses its `statusCode` and `message`
- **Other** → 500

**Why**: Consistent error responses and centralized logging without try/catch in every controller.

---

### 3. **asyncHandler Wrapper**

```javascript
const handler = asyncHandler(async (req, res) => {
  const data = await someService.getData();
  return response(res, 200, 'OK', data);
});
```

Wraps async handlers so rejected promises call `next(error)` automatically.

**Why**: Removes repetitive try/catch and ensures errors reach the global handler.

---

### 4. **Service Layer (Template: ProductService)**

`ProductService` demonstrates the pattern:

- Receives plain params (not `req`/`res`)
- Uses `AppError` subclasses (`ValidationError`, `NotFoundError`) for failures
- Returns data; controller is responsible for HTTP response

**Migration path**: Add services for other domains (Orders, Users, Invoice, etc.) and thin controllers accordingly.

---

### 5. **Security Fixes**

| Fix | Before | After |
|-----|--------|-------|
| Auto-update token | Hardcoded bcrypt hash | `AUTO_UPDATE_TOKEN_HASH` from env |
| CORS | `cors()` (allow all) | Whitelist from `config/default.json` |
| PM2 restart | Fire-and-forget | `await` until restart completes |

---

### 6. **Razorpay Webhook**

Replaced `require('./payment-capture.webhook')(req, res)` on each request with static imports and a dispatcher.

**Why**: Avoids per-request `require()` overhead and clarifies dependencies.

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AUTO_UPDATE_TOKEN_HASH` | Bcrypt hash for `/auto-update` auth |
| `PM2_APP_NAME_DEV` | PM2 app name in development |
| `PM2_APP_NAME_PROD` | PM2 app name in production |

Generate token hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-secret-token', 6))"
```

---

## Future Improvements

1. **Rate limiting**: Add `express-rate-limit` for auth, webhook, and public endpoints
2. **Repository layer**: Abstract Mongoose behind repositories for easier testing and DB changes
3. **Redis cache**: Replace `node-cache` for multi-instance deployments
4. **API documentation**: OpenAPI/Swagger for contracts and client generation
