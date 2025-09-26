# OmniBiz

OmniBiz is a full-stack web application designed to streamline business operations, including inventory management, e-commerce, appointments, finance, and analytics, with AI-powered features. It offers a unified platform for managing various business tasks efficiently.

## Features

- **Inventory Management**: Manage products, stock levels, and inventory operations.
- **E-Commerce**: A complete online store with product listings, shopping cart, and order management.
- **Appointment Scheduling**: Manage appointments with a calendar view, appointment creation, and tracking.
- **Finance Management**: Track invoices, expenses, and generate financial reports.
- **Analytics**: AI-powered insights and visualizations for business data.
- **AI**: Includes AI-powered features like OCR scanning for product identification.

## Tech Stack

- **Frontend**: React, React Context for state management, SCSS for styling.
- **Backend**: Node.js, Express.js, MongoDB for data storage.
- **APIs**: Custom API endpoints for managing users, inventory, products, appointments, invoices, etc.
- **External Services**: Integration with payment gateways, email and SMS services.

## Installation

### Prerequisites

1. **Node.js**: Ensure that Node.js is installed. If not, you can download it from [here](https://nodejs.org/).

2. **MongoDB**: You need to have MongoDB installed and running. You can set it up locally or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

3. **API Keys**: If you are using third-party integrations (SMS, email, etc.), make sure to have the required API keys.

### Steps to Run the Application

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd omni-biz-manager


2. **Frontend Setup**:

   * Navigate to the `frontend` directory:

     ```bash
     cd client
   * Install dependencies:

     ```bash
     pnpm install
   * Run the frontend application:

     ```bash
     pnpm run dev
   * The app should now be running at `http://localhost:3000`.

3. **Backend Setup**:

   * Navigate to the `server` directory:

     ```bash
     cd server
     ```

   * Install dependencies:

     ```bash
     pnpm install
     ```

   * Set up environment variables in a `.env` file (you can refer to `.env.example` for the required variables).

   * Run the backend server:

     ```bash
     pnpm run dev
     ```

   * The backend API should now be running at `http://localhost:5000`.

## Environment Variables

### Frontend (`frontend/.env`)

* `REACT_APP_API_URL`: The URL of the backend API (default: `http://localhost:5000`).

### Backend (`backend/.env`)

* `MONGO_URI`: MongoDB connection URI.
* `JWT_SECRET`: Secret for JWT token generation.
* `SENDGRID_API_KEY`: API key for SendGrid (if used for email notifications).
* `TWILIO_API_KEY`: API key for Twilio (if used for SMS notifications).
* `STRIPE_SECRET_KEY`: Stripe API key for payments.

## Running Tests

For frontend testing, you can run:

```bash
cd frontend
npm test
```

For backend testing, you can use tools like [Jest](https://jestjs.io/) or [Mocha](https://mochajs.org/), and run the tests from the `backend` directory.

## Contributing

Contributions are welcome! To contribute, please follow these steps:

1. **Fork** the repository.
2. **Clone** your fork locally.
3. Create a new branch (`git checkout -b feature/your-feature`).
4. Make changes and **commit** them (`git commit -m "Add your feature"`).
5. Push to your fork (`git push origin feature/your-feature`).
6. Open a **pull request** to merge your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Project Overview

### Frontend (/frontend)

* **Framework**: React
* **State Management**: React Context for global state management
* **Styling**: SCSS
* **Routing**: React Router
* **API Communication**: Axios for API calls
* **Components**: Modular components grouped by feature
* **Entry Point**: `index.js`, root component `App.jsx`

### Backend (/backend)

* **Framework**: Node.js with Express.js
* **Database**: MongoDB with Mongoose
* **Authentication**: JWT for user authentication
* **Middleware**: Includes error handling, authentication, and logging middlewares
* **APIs**: RESTful endpoints for managing resources like users, products, appointments, etc.
* **External Services**: Integrations with external services like SendGrid (for emails), Twilio (for SMS), Stripe (for payments)

## API Endpoints

* **POST `/api/auth/register`** - Register a new user.
* **POST `/api/auth/login`** - Login a user and get a JWT token.
* **GET `/api/products`** - Get a list of products.
* **POST `/api/products`** - Add a new product.
* **GET `/api/appointments`** - Get all appointments.
* **POST `/api/appointments`** - Create a new appointment.
* **GET `/api/invoices`** - Get all invoices.
* **POST `/api/invoices`** - Create a new invoice.

For detailed API documentation, refer to the backend's `README.md` file.

---

