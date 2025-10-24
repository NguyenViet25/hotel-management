# Hotel Management System

A comprehensive hotel management system built with ASP.NET Core 8.0, implementing a clean architecture approach with a 3-layer design (API, Services, Repositories).

## Features

- **User Management & RBAC**: Complete user management with role-based access control
- **Authentication**: JWT-based authentication with Google OAuth2 integration
- **Hotel Property Management**: Create and manage hotel properties with amenities
- **Room Management**: Manage rooms, room types, and availability
- **API Documentation**: Swagger/OpenAPI integration
- **CI/CD Pipeline**: GitHub Actions workflow for continuous integration and deployment
- **Containerization**: Docker support for easy deployment

## Architecture

The application follows a clean architecture approach with three main layers:

1. **API Layer** (HotelManagement.API): Handles HTTP requests, routing, and controllers
2. **Services Layer** (HotelManagement.Services): Contains business logic and service implementations
3. **Repository Layer** (HotelManagement.Repositories): Manages data access and persistence
4. **Domain Layer** (HotelManagement.Domain): Contains domain entities and business models

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- SQL Server (or Docker for containerized development)
- Visual Studio 2022 or VS Code

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/yourusername/hotel-management.git
   cd hotel-management
   ```

2. Restore dependencies
   ```
   dotnet restore
   ```

3. Update the connection string in `appsettings.json` or use the provided Docker setup

4. Apply database migrations
   ```
   dotnet ef database update --project HotelManagement.Repositories --startup-project HotelManagement.API
   ```

5. Run the application
   ```
   dotnet run --project HotelManagement.API
   ```

### Using Docker

1. Build and run using Docker Compose
   ```
   docker-compose up -d
   ```

2. Access the API at http://localhost:5000

## API Documentation

Swagger documentation is available at `/swagger` when running the application.

## Authentication

The system uses JWT Bearer tokens for authentication. To access protected endpoints:

1. Obtain a token via `/api/auth/login` or `/api/auth/google-login`
2. Include the token in the Authorization header: `Bearer {your_token}`

## CI/CD Pipeline

The project includes a GitHub Actions workflow for CI/CD:

- Builds and tests on every push to main and develop branches
- Deploys to development environment when changes are pushed to develop
- Deploys to production environment when changes are pushed to main

## License

This project is licensed under the MIT License - see the LICENSE file for details.