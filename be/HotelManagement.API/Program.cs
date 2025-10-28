using HotelManagement.Api.Infrastructure;
using HotelManagement.Services;
using HotelManagement.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityAndJwt(builder.Configuration);

builder.Services.AddRepositories();
builder.Services.AddApplicationServices();
builder.Services.AddApiSwagger(builder.Configuration);
builder.Services.AddControllers();

var app = builder.Build(); 

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel Management API v1");
        c.DocumentTitle = "Hotel Management API Docs";
        c.DefaultModelsExpandDepth(-1);
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
