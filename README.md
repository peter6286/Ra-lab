# NestJS TypeScript Starter Project

This project is a NestJS-based API for managing events and users. It includes CRUD operations for tasks (events), functionality for handling event invitees, and a method to merge overlapping events for a user.

## Requirements

- Node.js (>= 14.x)
- NPM (>= 6.x)
- MySQL (ensure you have it installed and running for database connectivity)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/peter6286/Ra-lab-master.git
cd RA-LAB-MASTER
```

### 2. Install Dependencies

Use npm to install the project dependencies:

```bash
npm install
```

### 3. Configure Database

Make sure your MySQL database is set up. Update the database configuration in `app.module.ts` or set up environment variables for your MySQL database.

**Default Configuration** (found in `app.module.ts`):

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: <Your user name>,
  password: <Your password>,
  database: 'nestjs_project',
  entities: [Event, User],
  synchronize: true,
}),
```

### 4. Running the Application

To start the application, use one of the following commands:

 - For development mode (with hot reload):
```bash
 npm run start:dev
 ```

 - For production mode:
 ```bash
 npm run start:prod
 ```

 - Standard start:
 ```bash
 npm run start
 ```

 Once started, the server will run at `http://localhost:3000` by default. You can access API endpoints using this URL.

## Testing

### 1. Run Tests

To run the automated tests and ensure everything works as expected:

```bash
npm test
```

## **API Endpoints**

The main endpoints of the API are as follows:

### **User Endpoints:**

- **`POST /users`**: Create a new user.
- **`GET /users`**: Retrieve all users.
- **`DELETE /users/:id`**: Delete a user by ID.

---

### **Event Endpoints:**

- **`POST /events`**: Create a new event.
- **`GET /events/:id`**: Retrieve an event by ID.
- **`GET /events`**: Retrieve all events.
- **`PATCH /events/:id`**: Update an event by ID.
- **`DELETE /events/:id`**: Delete an event by ID.
- **`GET /events/merge/:userId`**: Merge all overlapping events for a user (merges overlapping time intervals).

---

### **Testing the Endpoints**

Use a tool like `Postman` to test the endpoints manually.

## Test case cover

### **1. User Module**

The `User` module manages operations related to users, such as creation, retrieval, and deletion.

#### **1.1 UserController**

**Methods Covered:**

- **`createUser`:**
  - Verifies that a user can be created successfully.
  - Ensures `UserService.create` is called with the correct data.
  - Validates the response matches the created user.

- **`getAllUsers`:**
  - Verifies that all users are retrieved successfully.
  - Ensures `UserService.findAll` is called.
  - Validates the response matches the list of users.

---

#### **1.2 UserService**

**Methods Covered:**

- **`create`:**
  - Verifies that a new user is created and saved successfully in the database.
  - Mocks `userRepository.save` to validate the correct save behavior.

- **`findAll`:**
  - Verifies that all users are retrieved from the database.
  - Mocks `userRepository.find` to validate the correct retrieval behavior.

---

### **2. Event Module**

The `Event` module manages event-related operations, such as creation, updates, and merging overlapping events.

#### **2.1 EventController**

**Methods Covered:**

- **`createEvent`:**
  - Verifies that an event is created successfully.
  - Ensures `EventService.create` is called with the correct arguments.
  - Handles invalid `creatorId` and validates error responses.

- **`getEvent`:**
  - Verifies that an event can be retrieved by ID.
  - Ensures `EventService.findOne` is called with the correct ID.
  - Validates the response matches the retrieved event.

- **`getAllEvents`:**
  - Verifies that all events are retrieved successfully.
  - Ensures `EventService.findAll` is called.

- **`updateEvent`:**
  - Verifies that an event can be updated by ID.
  - Ensures `EventService.update` is called with the correct arguments.

- **`deleteEvent`:**
  - Verifies that an event can be deleted by ID.
  - Ensures `EventService.remove` is called with the correct ID.

- **`mergeEventsForUser`:**
  - Verifies that overlapping events for a user are merged successfully.
  - Ensures `EventService.mergeAllOverlappingEvents` is called with the correct user ID.

---

#### **2.2 EventService**

**Methods Covered:**

- **`create`:**
  - Verifies that an event is created and saved in the database.
  - Ensures `creator` and `invitees` are fetched and validated.
  - Handles errors for missing `creator` or `invitees`.

- **`findOne`:**
  - Verifies that an event can be retrieved by ID.
  - Ensures proper error handling when the event is not found.

- **`findAll`:**
  - Verifies that all events are retrieved from the database with relations.

- **`update`:**
  - Verifies that an event is updated successfully by ID.
  - Ensures proper behavior for updating event data.

- **`remove`:**
  - Verifies that an event can be deleted by ID.
  - Ensures proper error handling for non-existent events.

- **`mergeAllOverlappingEvents`:**
  - Verifies that overlapping events are merged correctly for a user.
  - Ensures the logic for identifying overlapping events works as expected.
  - Validates the deletion of original events and saving of merged events.


