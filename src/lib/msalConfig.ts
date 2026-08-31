
import { Configuration } from "@azure/msal-browser"; // Importa la interfaz 'Configuration' desde el paquete oficial de MSAL para navegador, la cual define la estructura tipada que debe tener el objeto de configuración.

export const msalConfig: Configuration = {// Exporta un objeto constante llamado 'msalConfig' tipado como 'Configuration', requerido por la instancia principal de MSAL (PublicClientApplication).

  auth: {// Objeto interno que agrupa las propiedades críticas de identidad y conexión con Azure AD / Entra ID.

    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,// El identificador único (Client ID / Application ID) de tu aplicación registrada en Azure Portal.
    // El sufijo '!' (non-null assertion operator) le indica a TypeScript que estás seguro de que esta variable de entorno no es nula o indefinida.

    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`, // La URL de la autoridad de autenticación. Combina el endpoint base de Microsoft con tu Tenant ID 
    // (identificador del directorio o inquilino), delimitando qué directorio de usuarios puede iniciar sesión.

    redirectUri: "http://localhost:3000",// La URL a la que Microsoft redirigirá al usuario en tu aplicación local (puerto 3000) // una vez que el proceso de autenticación o el flujo de tokens haya finalizado exitosamente.
  },

  cache: { cacheLocation: "sessionStorage" },// Configuración de almacenamiento en caché. 'sessionStorage' guarda los tokens y el estado // de la sesión únicamente mientras la pestaña o ventana del navegador permanezca abierta.
};

export const loginRequest = { scopes: ["openid", "profile"] };// Exporta un objeto de solicitud por defecto para el inicio de sesión. // Define los permisos (scopes) estándar de OpenID Connect requeridos para autenticar al usuario ("openid") 
// y obtener su información de perfil básica ("profile").

export const apiRequest = { scopes: [process.env.NEXT_PUBLIC_API_SCOPE!] };// Exporta un objeto de solicitud orientado a la obtención de un token de acceso (Access Token) 
// para consumir una API protegida propia, utilizando el scope específico definido en tus variables de entorno.