FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Adjust copy source paths
COPY be/HotelManagement.Api/HotelManagement.API.csproj HotelManagement.Api/
COPY be/HotelManagement.Domain/HotelManagement.Domain.csproj HotelManagement.Domain/
COPY be/HotelManagement.Repository/HotelManagement.Repository.csproj HotelManagement.Repository/
COPY be/HotelManagement.Services/HotelManagement.Services.csproj HotelManagement.Services/

# Restore
RUN dotnet restore HotelManagement.Api/HotelManagement.API.csproj

# Copy the rest
COPY be/ .

# Publish
RUN dotnet publish HotelManagement.Api/HotelManagement.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]
