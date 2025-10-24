FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["HotelManagement.sln", "./"]
COPY ["HotelManagement.API/HotelManagement.API.csproj", "HotelManagement.API/"]
COPY ["HotelManagement.Domain/HotelManagement.Domain.csproj", "HotelManagement.Domain/"]
COPY ["HotelManagement.Repositories/HotelManagement.Repositories.csproj", "HotelManagement.Repositories/"]
COPY ["HotelManagement.Services/HotelManagement.Services.csproj", "HotelManagement.Services/"]
RUN dotnet restore
COPY . .
WORKDIR "/src/HotelManagement.API"
RUN dotnet build "HotelManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HotelManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]