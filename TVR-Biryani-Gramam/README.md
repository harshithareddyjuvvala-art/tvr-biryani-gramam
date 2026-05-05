# TVR Biryani Gramam — Full Stack Restaurant Website

## Project Structure

```
tvr-restaurant/
├── backend/
│   ├── models/
│   │   └── menu.js          ← All 200+ menu items
│   ├── routes/
│   │   ├── menu.js          ← Menu API routes
│   │   ├── orders.js        ← Order API routes
│   │   └── reservations.js  ← Reservation API routes
│   ├── server.js            ← Express server
│   └── package.json
└── frontend/
    ├── index.html           ← Main HTML
    ├── css/
    │   └── style.css        ← All styles
    └── js/
        └── app.js           ← Frontend logic
```

## Setup & Run

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Open the website
Go to: http://localhost:3000

---

## API Endpoints

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/menu | All menu items |
| GET | /api/menu/categories | All category names |
| GET | /api/menu/category/:name | Items in a category |
| GET | /api/menu/search?q=chicken | Search items |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place a new order |
| GET | /api/orders | Get all orders (admin) |
| GET | /api/orders/:id | Get order by ID |
| PATCH | /api/orders/:id/status | Update order status |

#### Place Order — Request Body
```json
{
  "customerName": "Ravi Kumar",
  "phone": "+91 98765 43210",
  "orderType": "delivery",
  "address": "123 Main St, Parvatipuram",
  "items": [
    { "id": "nvb2", "name": "Chicken Dum Biryani", "price": 240, "quantity": 2 }
  ],
  "specialInstructions": "Extra spicy please"
}
```

### Reservations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reservations | Make a reservation |
| GET | /api/reservations | Get all reservations (admin) |
| GET | /api/reservations/:id | Get by ID or confirmation code |
| PATCH | /api/reservations/:id/status | Update status |
| DELETE | /api/reservations/:id | Cancel reservation |

#### Make Reservation — Request Body
```json
{
  "name": "Priya Sharma",
  "phone": "+91 98765 43210",
  "date": "2025-06-15",
  "time": "19:00",
  "guests": 4,
  "specialRequests": "Window table please"
}
```

---

## Order Status Flow
`received` → `preparing` → `ready` → `out-for-delivery` → `completed`

## Features
- Full menu with 200+ dishes across 17 categories
- Category tabs + search + veg/non-veg filter
- Add to cart with quantity management
- Online ordering (dine-in, pickup, delivery)
- Table reservations with confirmation codes
- Fully responsive (mobile, tablet, desktop)
- REST API ready for database integration

## To add a database (optional)
Replace the in-memory arrays in `routes/orders.js` and `routes/reservations.js`
with MongoDB, MySQL, or SQLite queries. The API interface stays the same.
