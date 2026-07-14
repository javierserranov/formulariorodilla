/**
 * Protege todo el sitio con autenticación HTTP Basic.
 * La contraseña se guarda como variable de entorno (BASIC_AUTH_PASSWORD)
 * en la configuración del proyecto de Cloudflare Pages, nunca en el código.
 * Acepta cualquier nombre de usuario; solo valida la contraseña.
 */
export async function onRequest(context) {
  const { request, env } = context;

  const validPass = env.BASIC_AUTH_PASSWORD;
  if (!validPass) {
    return new Response(
      'Falta configurar BASIC_AUTH_PASSWORD en las variables de entorno del proyecto.',
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    const encoded = authHeader.slice(6);
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch (e) {
      decoded = '';
    }
    const sepIndex = decoded.indexOf(':');
    const pass = sepIndex >= 0 ? decoded.slice(sepIndex + 1) : '';
    if (pass === validPass) {
      return context.next();
    }
  }

  return new Response('Acceso restringido. Ingresa la clave para continuar.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Registro post-operatorio de rodilla", charset="UTF-8"'
    }
  });
}
