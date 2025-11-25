using HotelManagement.Api.Infrastructure;
using HotelManagement.Services;
using HotelManagement.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityAndJwt(builder.Configuration);

builder.Services.AddRepositories();
builder.Services.AddApplicationServices();
builder.Services.AddEmailing(builder.Configuration);
builder.Services.AddApiSwagger(builder.Configuration);
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel Management API v1");
    c.DocumentTitle = "Hotel Management API Docs";
    c.DefaultModelsExpandDepth(-1);
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app.MapControllers();

// Initialize the database (apply migrations)
app.InitializeDatabase();

app.Run();
