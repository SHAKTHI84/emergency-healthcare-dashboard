# Emergency Healthcare System

A real-time emergency healthcare management platform designed to streamline reporting, response, and access to critical medical information during emergencies.

This project provides an integrated dashboard for patients, healthcare providers, and citizens to quickly report medical emergencies, locate nearby hospitals, access emergency contacts, and maintain personal medical records.

---

## Features

### **1. Emergency Dashboard**

* Instant **Emergency SOS** button for rapid alerts.
* Sections for reporting emergencies, finding hospitals, and reviewing health data.
* Real‑time display of critical information.

### **2. Report Emergency**

* Simple form to report any medical emergency.
* Location input, emergency description, user details.
* Integrated Google Maps panel for nearest hospitals (with fallback error display when API key is missing).

### **3. Hospital Finder**

* Users can search and locate nearby hospitals.
* Intended integration with Google Maps API.

### **4. User Authentication**

* Login & Signup pages for secure access.
* Role‑based redirection (patients, responders, admin — if applicable).

### **5. Patient Dashboard**

* Shows:

  * Quick emergency actions
  * Medical summary (blood type, allergies, last check-up, etc.)
  * Recent medical activity
  * Health metrics (add/view)

### **6. Emergency Contacts**

* Section to store important emergency numbers & personal contacts.

### **7. UI Highlights**

* Clean, responsive interface built with a modern frontend stack.
* Red alert banners, SOS buttons, and modular dashboard cards.

---

## Tech Stack

### **Frontend**

* React.js
* Tailwind CSS / Custom CSS (based on implementation)
* Google Maps JavaScript API (for hospital map)

### **Backend**

* Node.js / Express (assumed)
* REST API structure for managing users, emergencies, and health data

### **Database**

* MongoDB / PostgreSQL (based on project setup)

### **Authentication**

* JWT-based login system

*Note: Adjust the stack based on your actual implementation.*

---

## Project Structure

*(Customize as needed)*

```
/ client
  /src
    /components
    /pages
    /services
    /hooks
    App.js
    index.js

/ server
  /controllers
  /models
  /routes
  server.js
```

---

## Installation & Setup

### **1. Clone the repository**

```
git clone <repo-url>
cd emergency-healthcare
```

### **2. Install dependencies**

#### Frontend:

```
cd client
npm install
```

#### Backend:

```
cd server
npm install
```

### **3. Configure Environment Variables**

Create `.env` files for both frontend & backend.

Example for backend:

```
PORT=5000
MONGO_URI=your_database_url
JWT_SECRET=your_secret
```

Example for frontend:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
```

### **4. Run the project**

#### Frontend:

```
npm start
```

#### Backend:

```
npm run dev
```

---

## Testing

* Test user login & signup
* Test emergency form submissions
* Verify dashboard updates
* Validate Google Maps integration

---

## Troubleshooting

### **Google Maps Error:**

> "This page didn’t load Google Maps correctly. See the JavaScript console for technical details."

This occurs when:

* API key is missing or invalid
* Billing isn’t enabled
* Domain isn’t authorized

### **Login Redirect Issues**

Ensure backend authentication endpoints are working and returning valid JWT tokens.

---

## Future Enhancements

* Real-time emergency alerting with WebSockets
* Integration with ambulance services
* AI‑based triage suggestion system
* Mobile app support

---

## License

This project is open-source under the MIT License. Modify as needed.

---

## Acknowledgments

* Google Maps Platform
* Contributors to the Emergency Healthcare UI/UX

---

If you'd like, I can also:
✔ Add images/screenshots into the README
✔ Format it for GitHub
✔ Generate a professional project logo
✔ Write API documentation

Just tell me what you'd like next!
