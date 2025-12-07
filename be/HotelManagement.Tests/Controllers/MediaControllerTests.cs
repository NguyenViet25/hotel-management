using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Media.Dtos;
using HotelManagement.Services.Admin.Medias;
using HotelManagement.Services.Common;
using HotelManagement.Tests.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Microsoft.AspNetCore.Hosting;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class MediaControllerTests
{
    private static MediaController CreateController(Mock<IMediaService> mock)
    {
        var env = new Mock<IWebHostEnvironment>();
        env.SetupGet(e => e.WebRootPath).Returns("wwwroot");
        return new MediaController(mock.Object, env.Object);
    }

    [Fact]
    public async Task Upload_ReturnsOk_WhenServiceSuccess()
    {
        var mock = new Mock<IMediaService>();
        mock.Setup(s => s.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(ApiResponse<MediaUploadResponse>.Ok(new MediaUploadResponse { Id = 1, FileName = "photo.jpg", FileUrl = "url", ContentType = "image/jpeg", Size = 3 }));
        var controller = CreateController(mock);
        var ctx = ControllerTestHelper.CreateHttpContextWithRequest("http", "localhost");
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        using var ms = new MemoryStream(new byte[] { 1, 2, 3 });
        var file = new FormFile(ms, 0, ms.Length, "file", "photo.jpg") { Headers = new HeaderDictionary(), ContentType = "image/jpeg" };
        var result = await controller.Upload(new MediaController.MediaUploadRequest { File = file });
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Get_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IMediaService>();
        var resp = success ? ApiResponse<MediaResponse>.Ok(new MediaResponse { Id = 1, FileName = "name", FileUrl = "url", ContentType = "image/jpeg", Size = 100 }) : ApiResponse<MediaResponse>.Fail("fail");
        mock.Setup(s => s.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Get(1);
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task List_ReturnsOk()
    {
        var mock = new Mock<IMediaService>();
        mock.Setup(s => s.ListAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(ApiResponse<List<MediaResponse>>.Ok(new List<MediaResponse>()));
        var controller = CreateController(mock);
        var result = await controller.List();
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Update_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IMediaService>();
        var resp = success ? ApiResponse<MediaResponse>.Ok(new MediaResponse { Id = 1, FileName = "name", FileUrl = "url", ContentType = "image/jpeg", Size = 100 }) : ApiResponse<MediaResponse>.Fail("fail");
        mock.Setup(s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<MediaUpdateRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Update(1, new MediaUpdateRequest { FileName = "newname" });
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Delete_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IMediaService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("not found");
        mock.Setup(s => s.DeleteAsync(It.IsAny<int>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Delete(1);
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }
}
