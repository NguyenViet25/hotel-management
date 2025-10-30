# Build and publish the API using .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the full backend source into the build stage
COPY . .

# Restore dependencies (use absolute path to avoid path issues)
RUN dotnet restore /src/HotelManagement.Api/HotelManagement.API.csproj

# Publish the application (use absolute path)
RUN dotnet publish /src/HotelManagement.Api/HotelManagement.API.csproj -c Release -o /app/publish

# Final image with ASP.NET Core runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Configure Kestrel to listen on port 5000
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]