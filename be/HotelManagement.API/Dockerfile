# Build and publish the API using .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for better caching during restore
COPY HotelManagement.API/HotelManagement.API.csproj HotelManagement.API/
COPY HotelManagement.Domain/HotelManagement.Domain.csproj HotelManagement.Domain/
COPY HotelManagement.Repository/HotelManagement.Repository.csproj HotelManagement.Repository/
COPY HotelManagement.Services/HotelManagement.Services.csproj HotelManagement.Services/

# Restore dependencies
RUN dotnet restore HotelManagement.API/HotelManagement.API.csproj

# Copy the rest of the source code
COPY . .

# Publish the application
RUN dotnet publish HotelManagement.API/HotelManagement.API.csproj -c Release -o /app/publish

# Final image with ASP.NET Core runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Configure Kestrel to listen on port 5283
ENV ASPNETCORE_URLS=http://+:5283
EXPOSE 5283

ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]