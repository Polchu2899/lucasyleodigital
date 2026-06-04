# Reservify — Manual de Instalacion Interno
## Lucas y Leo Digital — USO EXCLUSIVO INTERNO

---

## 1. ALTA DE NUEVO CLIENTE (Onboarding)

### Paso 1: Crear proyecto Firebase (5 min)
1. Ir a https://console.firebase.google.com
2. Click "Agregar proyecto" → nombre: `reservify-[nombre-cliente]`
3. Desactivar Google Analytics (no lo necesitamos)
4. Ir a Firestore Database → Crear base de datos → Modo produccion
5. Reglas de Firestore: copiar las mismas de reservify-espaifest
6. Ir a Configuracion del proyecto → Tus apps → Web → Registrar app
7. Copiar el objeto `firebaseConfig` (apiKey, authDomain, projectId, etc.)

### Paso 2: Configurar Reservify panel (10 min)
1. Duplicar `reservify-firebase.html` → renombrar a `reservify-[cliente].html`
2. Cambiar el `firebaseConfig` con los datos del nuevo proyecto
3. Cambiar el email de login y la contrasena
4. Subir al hosting del cliente o a nuestro servidor
5. Entrar al panel y configurar:
   - Tarifas estandar (turnos, horarios, precios por dia)
   - Tarifas ampliadas si las hay
   - Dias especiales si los hay
   - Extras del formulario (catering, limpieza, etc.)

### Paso 3: Instalar el widget en la web del cliente (15-30 min)
Ver seccion de cada plataforma mas abajo.

### Paso 4: Verificacion final
- [ ] El calendario muestra los dias correctos
- [ ] Las franjas horarias aparecen al hacer clic en un dia
- [ ] El formulario se rellena correctamente
- [ ] Al enviar reserva: se guarda en Firebase
- [ ] Al enviar reserva: se bloquea el horario
- [ ] Emails llegan al cliente y al negocio
- [ ] WhatsApp se abre con datos correctos
- [ ] Reservify panel muestra la reserva
- [ ] Al confirmar/cancelar en Reservify se actualiza el calendario

---

## 2. INSTALACION POR PLATAFORMA

### WORDPRESS (Gutenberg / Elementor / Divi / cualquier theme)

**Metodo 1: Bloque HTML personalizado (el mas facil)**
1. Ir al panel de WordPress → Paginas → Editar la pagina donde va el calendario
2. Anadir un bloque "HTML personalizado" (en Gutenberg) o "HTML" (en Elementor)
3. Pegar este codigo:

```html
<div id="reservify-widget"></div>
<script src="https://www.lucasyleodigital.com/reservify/widget.js"
        data-project="NOMBRE-PROYECTO-FIREBASE"
        data-lang="es"
        data-color-primary="#FF6B35"
        data-color-accent="#2196F3"
        data-phone="34612345678"
        data-email="negocio@email.com">
</script>
```

4. Publicar la pagina
5. Verificar que carga correctamente

**Metodo 2: Via functions.php (para developers)**
Anadir al final de `functions.php` del theme hijo:
```php
function reservify_enqueue() {
    wp_enqueue_script('reservify-widget', 
        'https://www.lucasyleodigital.com/reservify/widget.js', 
        array(), null, true);
}
add_action('wp_enqueue_scripts', 'reservify_enqueue');
```
Y anadir el div en la plantilla: `<div id="reservify-widget" data-project="..."></div>`

**Metodo 3: Plugin de shortcode (si queremos profesionalizarlo)**
Crear un mini-plugin que registre un shortcode `[reservify project="nombre"]`

---

### WIX

1. Ir al Editor de Wix → la pagina donde va el calendario
2. Click "+" → "Embed" → "Incrustar un widget" → "HTML personalizado"
3. Click "Introducir codigo"
4. Pegar:

```html
<div id="reservify-widget"></div>
<script src="https://www.lucasyleodigital.com/reservify/widget.js"
        data-project="NOMBRE-PROYECTO-FIREBASE"
        data-lang="es"
        data-color-primary="#FF6B35"
        data-color-accent="#2196F3"
        data-phone="34612345678"
        data-email="negocio@email.com">
</script>
```

5. Ajustar el tamano del bloque (ancho 100%, alto 800px minimo)
6. Publicar

**IMPORTANTE Wix**: El widget se carga dentro de un iframe de Wix. Hay que asegurarse de que:
- El alto del bloque es suficiente (800-1000px)
- El ancho es 100%
- Los popups/modales funcionan dentro del iframe

---

### SQUARESPACE

1. Ir al Editor → la pagina donde va el calendario
2. Anadir un bloque "Codigo" (Code Block)
3. Pegar el mismo snippet HTML
4. Desmarcar "Display Source" si aparece la opcion
5. Guardar y publicar

---

### SHOPIFY

1. Ir a Tienda online → Paginas → Crear nueva pagina
2. En el editor, cambiar a modo HTML (icono "<>")
3. Pegar el snippet
4. Guardar

O para insertarlo en una pagina existente:
1. Ir a Tienda online → Temas → Editar codigo
2. Buscar el template de la pagina deseada
3. Insertar el snippet donde corresponda

---

### HTML PURO / WEB PERSONALIZADA

Simplemente pegar el snippet en el HTML donde quieras el calendario:
```html
<div id="reservify-widget"></div>
<script src="https://www.lucasyleodigital.com/reservify/widget.js"
        data-project="NOMBRE-PROYECTO-FIREBASE"
        data-lang="es"
        data-color-primary="#FF6B35"
        data-color-accent="#2196F3"
        data-phone="34612345678"
        data-email="negocio@email.com">
</script>
```

---

## 3. PARAMETROS DE CONFIGURACION DEL WIDGET

| Parametro | Obligatorio | Ejemplo | Descripcion |
|-----------|-------------|---------|-------------|
| data-project | SI | "reservify-espaifest" | ID del proyecto Firebase del cliente |
| data-lang | NO | "es" / "ca" / "en" / "de" | Idioma (default: "es") |
| data-color-primary | NO | "#FF6B35" | Color principal del calendario |
| data-color-accent | NO | "#2196F3" | Color de acento/disponible |
| data-phone | NO | "34612345678" | Telefono WhatsApp del negocio |
| data-email | NO | "info@negocio.com" | Email del negocio (para reservas) |
| data-theme | NO | "light" / "dark" | Tema claro u oscuro (default: "light") |
| data-position | NO | "inline" / "floating" | Inline en la pagina o boton flotante |

---

## 4. CHECKLIST NUEVO CLIENTE

```
CLIENTE: ___________________________
PLAN: [ ] Basico (29€)  [ ] Pro (49€)  [ ] Premium (79€)
PLATAFORMA WEB: [ ] WordPress  [ ] Wix  [ ] Squarespace  [ ] HTML  [ ] Otra: ____

SETUP:
[ ] Proyecto Firebase creado: reservify-________________
[ ] Firestore configurado con reglas
[ ] Reservify panel duplicado y configurado
[ ] Login creado para el cliente
[ ] Tarifas configuradas
[ ] Extras del formulario configurados
[ ] Widget instalado en la web del cliente
[ ] Verificacion completa (ver paso 4 del onboarding)
[ ] Email de bienvenida enviado al cliente
[ ] Formacion basica realizada (Premium)

DATOS FACTURACION:
Fecha alta: ____/____/________
Metodo pago: [ ] Stripe  [ ] Transferencia  [ ] Bizum
Proximo cobro: ____/____/________
```

---

## 5. MANTENIMIENTO MENSUAL

Para cada cliente activo:
- Verificar que Firebase no supera cuotas gratuitas
- Comprobar que las reservas se procesan correctamente
- Actualizar el widget.js si hay nueva version
- Responder dudas del panel Reservify

---

## 6. TROUBLESHOOTING

### "El calendario no carga"
1. Verificar que el data-project es correcto
2. Verificar que el widget.js esta accesible (abrir URL en navegador)
3. Verificar consola del navegador (F12) para errores
4. Comprobar que Firebase no esta bloqueado por CORS

### "Las reservas no se guardan"
1. Verificar reglas de Firestore (deben permitir escritura)
2. Verificar que el firebaseConfig es correcto
3. Comprobar cuota de Firebase (plan Spark: 50K lecturas/dia)

### "Los emails no llegan"
1. Verificar configuracion de Resend/EmailJS
2. Comprobar carpeta de spam del cliente
3. Verificar que el email del remitente esta verificado

### "Wix: el widget se ve cortado"
1. Aumentar la altura del bloque HTML en Wix (minimo 900px)
2. Si usa popups, puede que Wix los bloquee dentro del iframe
