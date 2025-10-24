# Hotel Management System - Test Project

## Overview

This project contains unit tests and integration tests for the Hotel Management System. The tests are organized by the layer they are testing (Services, Controllers, Repositories).

## Test Structure

- **Services Tests**: Tests for service layer classes that contain business logic
- **Controllers Tests**: Tests for API controllers that handle HTTP requests
- **Repositories Tests**: Tests for data access layer components

## Technologies Used

- xUnit: Testing framework
- Moq: Mocking framework for creating test doubles
- FluentAssertions: For more readable assertions (optional)

## Running Tests

You can run the tests using the following methods:

### Using Visual Studio

1. Open the solution in Visual Studio
2. Right-click on the `HotelManagement.Tests` project in Solution Explorer
3. Select "Run Tests"

### Using .NET CLI

From the root directory of the project, run:

```bash
dotnet test HotelManagement.Tests/HotelManagement.Tests.csproj
```

## Test Coverage

The tests cover the following components:

### Service Layer Tests

- UserService
- RoleService
- HotelPropertyService
- RoomService

### Controller Layer Tests

- UserController
- HotelPropertyController
- RoomController

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create test classes that match the naming pattern of the class being tested (e.g., `UserServiceTests` for `UserService`)
2. Group related tests within the same test class
3. Use descriptive test method names that explain what is being tested and the expected outcome
4. Follow the Arrange-Act-Assert pattern in test methods
5. Use mocks for dependencies to isolate the component being tested

## Continuous Integration

These tests are automatically run as part of the CI/CD pipeline defined in `.github/workflows/ci-cd.yml`. Tests must pass for the build to succeed and deployment to proceed.