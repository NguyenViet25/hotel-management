# Hotel Management System - Architecture Documentation

## System Architecture Overview

The Hotel Management System follows a clean, layered architecture that separates concerns and promotes maintainability, testability, and scalability. The system is built using ASP.NET Core 8.0 and follows modern software development practices.

## Architectural Layers

### 1. Presentation Layer (API)

**Project: HotelManagement.API**

This layer is responsible for handling HTTP requests, API endpoints, and serving as the interface for client applications. It contains:

- **Controllers**: Handle incoming HTTP requests and return appropriate responses
- **Middleware**: For request processing, authentication, and exception handling
- **API Documentation**: Swagger/OpenAPI configuration for API documentation

### 2. Business Logic Layer (Services)

**Project: HotelManagement.Services**

This layer contains the core business logic of the application. It implements business rules, workflows, and coordinates activities between the presentation and data access layers. It includes:

- **Service Interfaces**: Define contracts for business operations
- **Service Implementations**: Implement business logic and workflows
- **Models**: DTOs (Data Transfer Objects) for service operations
- **Validators**: Business rule validation logic

### 3. Data Access Layer (Repositories)

**Project: HotelManagement.Repositories**

This layer is responsible for data persistence and retrieval. It abstracts the underlying data storage mechanisms and provides a clean interface for the business layer. It includes:

- **Repository Interfaces**: Define contracts for data access operations
- **Repository Implementations**: Implement data access operations
- **Unit of Work**: Manages transactions and provides a unified interface for repositories
- **Database Context**: Entity Framework Core DbContext for database operations

### 4. Domain Layer

**Project: HotelManagement.Domain**

This layer contains the core domain entities, enums, and business models that represent the business concepts and rules. It includes:

- **Entities**: Domain objects that represent business concepts
- **Enums**: Enumeration types for domain concepts
- **Value Objects**: Immutable objects that represent domain values

## Cross-Cutting Concerns

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Logging**: Centralized logging for application events and errors
- **Exception Handling**: Global exception handling and error responses
- **Validation**: Input validation using data annotations and FluentValidation

## Dependency Flow

The dependencies flow inward, with the domain layer at the center:

```
API Layer → Service Layer → Repository Layer → Domain Layer
```

Each layer depends only on the layers below it, promoting loose coupling and separation of concerns.

## Database Design

The system uses Entity Framework Core with SQL Server as the database provider. The database schema follows the domain model with appropriate relationships between entities.

Key entities include:
- Users and Roles (Authentication and Authorization)
- Hotel Properties (Hotel information and details)
- Rooms and Room Types (Room inventory and categorization)
- Bookings and Reservations (Guest stays and reservations)
- Payments (Financial transactions)

## Authentication Flow

1. **User Authentication**:
   - User provides credentials (username/password or Google OAuth)
   - System validates credentials and issues JWT token
   - Token contains user identity and roles for authorization

2. **Token Validation**:
   - Client includes token in Authorization header
   - System validates token signature, expiration, and claims
   - Authorized requests proceed to the requested resource

## Deployment Architecture

The system is containerized using Docker and can be deployed to various environments:

- **Development**: Local Docker environment with development settings
- **Staging**: Azure Web App with staging configuration
- **Production**: Azure Web App with production configuration

The CI/CD pipeline automates the build, test, and deployment process using GitHub Actions.

## Security Considerations

- **Authentication**: JWT tokens with appropriate expiration
- **Authorization**: Role-based access control for API endpoints
- **Data Protection**: Sensitive data encryption
- **Input Validation**: Request validation to prevent injection attacks
- **HTTPS**: All communications secured with TLS/SSL

## Scalability Considerations

- **Stateless Design**: Enables horizontal scaling
- **Database Optimization**: Indexes and query optimization
- **Caching**: Response caching for frequently accessed data
- **Asynchronous Operations**: Non-blocking I/O for improved throughput