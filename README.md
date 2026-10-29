# Emergency Home Services Auto-Dispatch System

A full-stack web application designed to simplify emergency home service bookings and help connect customers with nearby available technicians.

## Project Overview

The Emergency Home Services Auto-Dispatch System allows customers to request home repair services such as plumbing, electrical work, AC repair, appliance repair, carpentry, and home painting. The system identifies suitable available technicians based on service type, availability, online status, and geographical distance.

## Features

- **Emergency Service Booking:** Submit requests for home repair and maintenance services.
- **Automatic Technician Assignment:** Find a suitable nearby technician using geographical distance.
- **Worker Dashboard:** View assigned bookings and manage job status.
- **Booking Status Tracking:** Follow booking updates such as Pending, Accepted, On the Way, and Completed.
- **Map Integration:** Display customer and technician locations, with route visualization using Leaflet and OSRM.
- **Admin Dashboard:** Manage technicians and monitor bookings.
- **Contact Management:** Store and manage customer contact messages.
- **Customer Reviews:** Submit ratings and feedback after a completed service.
- **Responsive Interface:** React-based user interface for convenient navigation.

## Technologies Used

**Frontend**
- React.js
- Vite
- CSS
- Leaflet

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB
- Mongoose

**Mapping and Routing**
- Leaflet
- OpenStreetMap
- OSRM Routing Service

## Project Structure

```text
emergency-home-services/
├── emergency-home-services/   # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
└── .gitignore
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB
- Git

### 1. Clone the repository

```bash
git clone https://github.com/revathica/emergency-home-services.git
cd emergency-home-services
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and configure the environment variables required by your backend, including the MongoDB connection string and port.

Do not upload your `.env` file or database credentials to GitHub.

### 3. Start the backend

```bash
npm start
```

Use the start command defined in `server/package.json`. If your project uses a different script, run that script instead.

### 4. Install and start the frontend

Open a second terminal from the repository root:

```bash
cd emergency-home-services
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## How It Works

1. A customer selects a service and submits a booking request.
2. The application obtains the customer's location when location access is permitted.
3. The system searches for suitable available and online technicians.
4. The nearest eligible technician is selected for assignment.
5. Booking and technician status updates are displayed through the application.
6. Map and route information can help visualize the journey to the customer.
7. After completion, the customer can submit a rating and review.

Actual assignment and tracking behavior depends on the configured backend and the availability of valid location data.

## Future Enhancements

- Real-time technician location updates.
- Push notifications for booking acceptance and status changes.
- Improved retry and timeout handling for technician assignment.
- Deployment to a production hosting environment.

## Author

**Revathi C A**

## License

This project was developed for learning and project demonstration purposes.

## 🎥 Project Demo Video

Watch the demonstration of my Emergency Home Services Auto-Dispatch System:

[Click here to watch the Demo Video](https://youtu.be/WSsRB1BPZic?si=LVIdNhkjP1n2qlmB)