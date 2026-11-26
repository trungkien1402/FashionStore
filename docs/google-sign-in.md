# Google sign-in

Create a Web application OAuth client in Google Auth Platform. Register
`https://localhost:7251/signin-google` under **Authorized redirect URIs**.
Use the HTTPS launch URL to test sign-in. If you also launch the app over HTTP,
register the corresponding callback (`http://localhost:5000/signin-google`
or `http://localhost:5046/signin-google`).

From the repository root, set the credentials locally in .NET User Secrets.

```powershell
dotnet user-secrets set "Authentication:Google:ClientId" "<client-id>" --project .\FashionStore\FashionStore.csproj
dotnet user-secrets set "Authentication:Google:ClientSecret" "<client-secret>" --project .\FashionStore\FashionStore.csproj
```

Restart the application using the Development launch profile, then open
`https://localhost:7251/Account/Login` and select **Google**. The button is
enabled when both configuration values are set.

For a deployed environment, use its secret store or the
`Authentication__Google__ClientId` and `Authentication__Google__ClientSecret`
environment variables. Register the deployed HTTPS callback ending in
`/signin-google` for its OAuth client.
