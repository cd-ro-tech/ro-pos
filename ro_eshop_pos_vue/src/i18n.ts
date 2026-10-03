import { portuguese } from './portuguese';
import { ref, watch } from "vue";

export type Locale = "zh-CN" | "en-US" | "it-IT" | "es-ES" | "pt-PT";

const STORAGE_KEY = "ro-pos-locale";
const supported: Locale[] = ["zh-CN", "en-US", "it-IT", "es-ES", "pt-PT"];
const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
export const locale = ref<Locale>(supported.includes(saved as Locale) ? saved! : "zh-CN");
export const languageOptions = [
  { value: "zh-CN" as const, label: "中文" },
  { value: "en-US" as const, label: "English" },
  { value: "it-IT" as const, label: "Italiano" },
  { value: "es-ES" as const, label: "Español" },
  { value: "pt-PT" as const, label: "Português" },
];

type Translation = [string, string, string, string?];
const phrases: Record<string, Translation> = {
  "仅用于没有图片的商品；默认统一使用灰色底图。": ["Used for products without images. The default placeholder has a grey background in every theme.", "Usata per prodotti senza immagine. Lo sfondo predefinito è grigio in tutti i temi.", "Para productos sin imagen. El fondo predeterminado es gris en todos los temas.", "Para produtos sem imagem. O fundo predefinido é cinzento em todos os temas."],

  "主题设置": ["Theme settings", "Impostazioni tema", "Ajustes del tema", "Definições do tema"],
  "主题颜色": ["Theme colour", "Colore del tema", "Color del tema", "Cor do tema"],
  "经典蓝": ["Classic blue", "Blu classico", "Azul clásico", "Azul clássico"],
  "活力橙": ["Vibrant orange", "Arancione vivace", "Naranja vivo", "Laranja vivo"],
  "黑金": ["Black and gold", "Nero e oro", "Negro y dorado", "Preto e dourado"],
  "商品占位图": ["Product placeholder", "Immagine prodotto predefinita", "Imagen de producto predeterminada", "Imagem predefinida do produto"],
  "主页图片": ["Home image", "Immagine iniziale", "Imagen de inicio", "Imagem inicial"],
  "设置仅保存在本机，应用于登录页、收银台和工作台。": ["Saved on this device for the login page, checkout and workspace.", "Salvato su questo dispositivo per accesso, cassa e area di lavoro.", "Se guarda en este dispositivo para el acceso, la caja y el espacio de trabajo.", "Guardado neste dispositivo para o início de sessão, caixa e área de trabalho."],
  "仅用于没有图片的商品；未上传时随主题切换。": ["Used for products without images. Follows the theme until you upload an image.", "Usata per prodotti senza immagine. Segue il tema finché non carichi un’immagine.", "Para productos sin imagen. Sigue el tema hasta que subas una imagen.", "Para produtos sem imagem. Segue o tema até carregar uma imagem."],
  "用于登录首页的主视觉和背景。": ["Used for the login page image and background.", "Usata come immagine e sfondo della pagina di accesso.", "Se usa como imagen y fondo de la página de acceso.", "Usada como imagem e fundo da página de início de sessão."],
  "支持 JPG、PNG、WebP，最大 5MB；图片会自动缩小后保存在本机。": ["JPG, PNG or WebP, up to 5MB. Images are resized and saved on this device.", "JPG, PNG o WebP, fino a 5MB. Le immagini vengono ridimensionate e salvate su questo dispositivo.", "JPG, PNG o WebP, hasta 5MB. Las imágenes se reducen y guardan en este dispositivo.", "JPG, PNG ou WebP, até 5MB. As imagens são reduzidas e guardadas neste dispositivo."],
  "正在处理图片…": ["Processing image…", "Elaborazione immagine…", "Procesando imagen…", "A processar imagem…"],
  "主题设置已保存": ["Theme settings saved", "Impostazioni tema salvate", "Ajustes del tema guardados", "Definições do tema guardadas"],
  "主题设置格式不正确": ["Invalid theme settings", "Impostazioni tema non valide", "Ajustes del tema no válidos", "Definições do tema inválidas"],
  "本机存储空间不足，图片未保存，请换用较小图片": ["Local storage is full. Image not saved; choose a smaller image.", "Spazio locale esaurito. Immagine non salvata; scegli un’immagine più piccola.", "Almacenamiento local lleno. Imagen no guardada; elige una más pequeña.", "Armazenamento local cheio. Imagem não guardada; escolha uma mais pequena."],
  "图片无法读取，请换一张图片": ["Cannot read this image. Choose another image.", "Impossibile leggere l’immagine. Scegline un’altra.", "No se puede leer la imagen. Elige otra.", "Não é possível ler a imagem. Escolha outra."],
  "图片压缩后仍过大，请换用较小图片": ["The resized image is still too large. Choose a smaller image.", "L’immagine ridimensionata è ancora troppo grande. Scegline una più piccola.", "La imagen reducida sigue siendo demasiado grande. Elige una más pequeña.", "A imagem reduzida continua demasiado grande. Escolha uma mais pequena."],
  "上传图片": ["Upload image", "Carica immagine", "Subir imagen", "Carregar imagem"],

  "请求必须是对象": ["The request must be an object", "La richiesta deve essere un oggetto", "La solicitud debe ser un objeto", "O pedido tem de ser um objeto"],
  "请求包含不支持的字段": ["The request contains unsupported fields", "La richiesta contiene campi non supportati", "La solicitud contiene campos no compatibles", "O pedido contém campos não suportados"],
  "连接参数必须是对象": ["Connection parameters must be an object", "I parametri di connessione devono essere un oggetto", "Los parámetros de conexión deben ser un objeto", "Os parâmetros de ligação têm de ser um objeto"],
  "连接参数包含不支持的字段": ["Connection parameters contain unsupported fields", "I parametri di connessione contengono campi non supportati", "Los parámetros de conexión contienen campos no compatibles", "Os parâmetros de ligação contêm campos não suportados"],
  "客显行必须是对象": ["A customer display line must be an object", "Una riga del display cliente deve essere un oggetto", "Una línea del visor del cliente debe ser un objeto", "Uma linha do visor do cliente tem de ser um objeto"],
  "客显行包含不支持的字段": ["The customer display line contains unsupported fields", "La riga del display cliente contiene campi non supportati", "La línea del visor del cliente contiene campos no compatibles", "A linha do visor do cliente contém campos não suportados"],
  "requestId必须为8至128位字母、数字、下划线或连字符": ["requestId must contain 8 to 128 letters, digits, underscores or hyphens", "requestId deve contenere da 8 a 128 lettere, cifre, trattini bassi o trattini", "requestId debe contener entre 8 y 128 letras, dígitos, guiones bajos o guiones", "requestId deve conter entre 8 e 128 letras, algarismos, sublinhados ou hífenes"],
  "不支持的设备动作": ["Unsupported device action", "Azione del dispositivo non supportata", "Acción del dispositivo no compatible", "Ação do dispositivo não suportada"],
  "不支持的连接方式": ["Unsupported connection method", "Metodo di connessione non supportato", "Método de conexión no compatible", "Método de ligação não suportado"],
  "设备地址必须为RFC1918内网IPv4地址": ["The device address must be a private IPv4 address defined by RFC1918", "L’indirizzo del dispositivo deve essere un indirizzo IPv4 privato definito da RFC1918", "La dirección del dispositivo debe ser una dirección IPv4 privada definida por RFC1918", "O endereço do dispositivo tem de ser um endereço IPv4 privado definido pela RFC1918"],
  "端口必须为1至65535": ["The port must be between 1 and 65535", "La porta deve essere compresa tra 1 e 65535", "El puerto debe estar entre 1 y 65535", "A porta tem de estar entre 1 e 65535"],
  "Webservice路径必须为字符串": ["The Webservice path must be a string", "Il percorso Webservice deve essere una stringa", "La ruta de Webservice debe ser una cadena de texto", "O caminho Webservice tem de ser uma cadeia de texto"],
  "请填写设备实际Webservice路径，不能包含查询参数或转义字符": ["Enter the device’s actual Webservice path without query parameters or escape characters", "Inserire il percorso Webservice effettivo del dispositivo, senza parametri di query o caratteri di escape", "Introduzca la ruta real de Webservice del dispositivo, sin parámetros de consulta ni caracteres de escape", "Introduza o caminho Webservice real do dispositivo, sem parâmetros de consulta nem caracteres de escape"],
  "串口号必须为1至256": ["The serial port number must be between 1 and 256", "Il numero della porta seriale deve essere compreso tra 1 e 256", "El número de puerto serie debe estar entre 1 y 256", "O número da porta série tem de estar entre 1 e 256"],
  "不支持的串口速率": ["Unsupported serial baud rate", "Velocità della porta seriale non supportata", "Velocidad del puerto serie no compatible", "Velocidade da porta série não suportada"],
  "串口参数无效": ["Invalid serial port parameters", "Parametri della porta seriale non validi", "Parámetros del puerto serie no válidos", "Parâmetros da porta série inválidos"],
  "超时必须为1000至30000毫秒": ["The timeout must be between 1000 and 30000 milliseconds", "Il timeout deve essere compreso tra 1000 e 30000 millisecondi", "El tiempo de espera debe estar entre 1000 y 30000 milisegundos", "O tempo limite tem de estar entre 1000 e 30000 milissegundos"],
  "客显需要1至2行": ["The customer display requires 1 or 2 lines", "Il display cliente richiede 1 o 2 righe", "El visor del cliente requiere 1 o 2 líneas", "O visor do cliente requer 1 ou 2 linhas"],
  "客显行号或内容无效": ["Invalid customer display line number or content", "Numero di riga o contenuto del display cliente non valido", "Número de línea o contenido del visor del cliente no válido", "Número de linha ou conteúdo do visor do cliente inválido"],
  "客显仅支持ASCII字符": ["The customer display supports ASCII characters only", "Il display cliente supporta solo caratteri ASCII", "El visor del cliente solo admite caracteres ASCII", "O visor do cliente só suporta caracteres ASCII"],
  "每行客显内容最多20个ASCII字符": ["Each customer display line can contain at most 20 ASCII characters", "Ogni riga del display cliente può contenere al massimo 20 caratteri ASCII", "Cada línea del visor del cliente puede contener como máximo 20 caracteres ASCII", "Cada linha do visor do cliente pode conter, no máximo, 20 caracteres ASCII"],
  "客显行号不能重复": ["Customer display line numbers must not be repeated", "I numeri di riga del display cliente non possono essere duplicati", "Los números de línea del visor del cliente no pueden repetirse", "Os números de linha do visor do cliente não podem repetir-se"],
  "此动作不接受客显内容": ["This action does not accept customer display content", "Questa azione non accetta contenuti per il display cliente", "Esta acción no acepta contenido para el visor del cliente", "Esta ação não aceita conteúdo para o visor do cliente"],
  "设备响应不符合已核实的XML格式": ["The device response does not match the verified XML format", "La risposta del dispositivo non corrisponde al formato XML verificato", "La respuesta del dispositivo no coincide con el formato XML verificado", "A resposta do dispositivo não corresponde ao formato XML verificado"],
  "设备响应缺少有效的错误码、忙碌状态或末条命令序号": ["The device response is missing a valid error code, busy status or last command sequence number", "Nella risposta del dispositivo manca un codice di errore valido, lo stato di occupato o il numero di sequenza dell’ultimo comando", "Falta un código de error válido, el estado de ocupado o el número de secuencia del último comando en la respuesta del dispositivo", "Falta um código de erro válido, o estado de ocupado ou o número de sequência do último comando na resposta do dispositivo"],
  "设备忙碌，未确认本次动作完成；不会自动重试": ["The device is busy; completion of this action has not been confirmed. No automatic retry will occur", "Il dispositivo è occupato; il completamento di questa azione non è stato confermato. Non verrà effettuato alcun tentativo automatico", "El dispositivo está ocupado; no se ha confirmado que esta acción haya finalizado. No se reintentará automáticamente", "O dispositivo está ocupado; a conclusão desta ação não foi confirmada. Não haverá nova tentativa automática"],
  "设备响应缺少模式或空闲状态": ["The device response is missing the mode or idle status", "Nella risposta del dispositivo manca la modalità o lo stato di inattività", "Falta el modo o el estado de inactividad en la respuesta del dispositivo", "Falta o modo ou o estado de inatividade na resposta do dispositivo"],
  "设备状态已读取": ["Device status read", "Stato del dispositivo letto", "Estado del dispositivo leído", "Estado do dispositivo lido"],
  "末条命令序号与本次请求不符，动作可能只执行了一部分；不会自动重试": ["The last command sequence number does not match this request; the action may have been only partially executed. No automatic retry will occur", "Il numero di sequenza dell’ultimo comando non corrisponde a questa richiesta; l’azione potrebbe essere stata eseguita solo in parte. Non verrà effettuato alcun tentativo automatico", "El número de secuencia del último comando no coincide con esta solicitud; la acción podría haberse ejecutado solo parcialmente. No se reintentará automáticamente", "O número de sequência do último comando não corresponde a este pedido; a ação pode ter sido executada apenas parcialmente. Não haverá nova tentativa automática"],
  "设备确认开箱命令已执行，请核对钱箱实际状态": ["The device confirmed execution of the drawer-opening command; check the actual state of the cash drawer", "Il dispositivo ha confermato l’esecuzione del comando di apertura; verificare lo stato effettivo del cassetto portadenaro", "El dispositivo ha confirmado la ejecución del comando de apertura; compruebe el estado real del cajón portamonedas", "O dispositivo confirmou a execução do comando de abertura; verifique o estado real da gaveta de dinheiro"],
  "设备确认客显命令已执行，请核对显示内容": ["The device confirmed execution of the customer display command; check the displayed content", "Il dispositivo ha confermato l’esecuzione del comando del display cliente; verificare il contenuto visualizzato", "El dispositivo ha confirmado la ejecución del comando del visor del cliente; compruebe el contenido mostrado", "O dispositivo confirmou a execução do comando do visor do cliente; verifique o conteúdo apresentado"],
  "设备响应过大，执行结果未知；不会自动重试": ["The device response is too large; the execution result is unknown. No automatic retry will occur", "La risposta del dispositivo è troppo grande; l’esito dell’esecuzione è sconosciuto. Non verrà effettuato alcun tentativo automatico", "La respuesta del dispositivo es demasiado grande; se desconoce el resultado de la ejecución. No se reintentará automáticamente", "A resposta do dispositivo é demasiado grande; o resultado da execução é desconhecido. Não haverá nova tentativa automática"],
  "设备响应中断，执行结果未知；不会自动重试": ["The device response was interrupted; the execution result is unknown. No automatic retry will occur", "La risposta del dispositivo è stata interrotta; l’esito dell’esecuzione è sconosciuto. Non verrà effettuato alcun tentativo automatico", "La respuesta del dispositivo se ha interrumpido; se desconoce el resultado de la ejecución. No se reintentará automáticamente", "A resposta do dispositivo foi interrompida; o resultado da execução é desconhecido. Não haverá nova tentativa automática"],
  "设备连接超时，执行结果未知；不会自动重试": ["The device connection timed out; the execution result is unknown. No automatic retry will occur", "La connessione al dispositivo è scaduta; l’esito dell’esecuzione è sconosciuto. Non verrà effettuato alcun tentativo automatico", "Se ha agotado el tiempo de espera de la conexión con el dispositivo; se desconoce el resultado de la ejecución. No se reintentará automáticamente", "A ligação ao dispositivo excedeu o tempo limite; o resultado da execução é desconhecido. Não haverá nova tentativa automática"],
  "设备连接失败或中断，执行结果未知；不会自动重试": ["The device connection failed or was interrupted; the execution result is unknown. No automatic retry will occur", "La connessione al dispositivo non è riuscita o è stata interrotta; l’esito dell’esecuzione è sconosciuto. Non verrà effettuato alcun tentativo automatico", "La conexión con el dispositivo ha fallado o se ha interrumpido; se desconoce el resultado de la ejecución. No se reintentará automáticamente", "A ligação ao dispositivo falhou ou foi interrompida; o resultado da execução é desconhecido. Não haverá nova tentativa automática"],
  "Multidriver.ini包含无法识别的配置行": ["Multidriver.ini contains an unrecognized configuration line", "Multidriver.ini contiene una riga di configurazione non riconosciuta", "Multidriver.ini contiene una línea de configuración no reconocida", "Multidriver.ini contém uma linha de configuração não reconhecida"],
  "Multidriver.ini存在重复配置": ["Multidriver.ini contains duplicate settings", "Multidriver.ini contiene impostazioni duplicate", "Multidriver.ini contiene ajustes duplicados", "Multidriver.ini contém definições duplicadas"],
  "请先由操作人员设置CHK_STATES=0、END_PAPER_FILE=0、SILENT_ERR=1；连接程序不会改写驱动配置": ["An operator must first set CHK_STATES=0, END_PAPER_FILE=0 and SILENT_ERR=1; the bridge will not modify the driver configuration", "Un operatore deve prima impostare CHK_STATES=0, END_PAPER_FILE=0 e SILENT_ERR=1; il programma di connessione non modificherà la configurazione del driver", "Un operador debe configurar primero CHK_STATES=0, END_PAPER_FILE=0 y SILENT_ERR=1; el programa de conexión no modificará la configuración del controlador", "Um operador tem de definir primeiro CHK_STATES=0, END_PAPER_FILE=0 e SILENT_ERR=1; o programa de ligação não modificará a configuração do controlador"],
  "Multidriver.ini缺少Models、PATH_IN或PATH_OUT": ["Multidriver.ini is missing Models, PATH_IN or PATH_OUT", "In Multidriver.ini manca Models, PATH_IN o PATH_OUT", "Falta Models, PATH_IN o PATH_OUT en Multidriver.ini", "Falta Models, PATH_IN ou PATH_OUT em Multidriver.ini"],
  "设备目录已被锁定；请确认其他连接程序或上次异常执行已结束后，由操作人员检查并恢复": ["The device directory is locked. Confirm that any other bridge process or previous abnormal execution has ended, then have an operator inspect and restore operation", "La cartella del dispositivo è bloccata. Verificare che altri programmi di connessione o la precedente esecuzione anomala siano terminati, quindi far controllare e ripristinare il funzionamento da un operatore", "La carpeta del dispositivo está bloqueada. Confirme que los demás programas de conexión o la ejecución anómala anterior hayan terminado y solicite a un operador que revise y restablezca el funcionamiento", "A pasta do dispositivo está bloqueada. Confirme que outros programas de ligação ou a execução anómala anterior terminaram e peça a um operador que verifique e reponha o funcionamento"],
  "MultiDriver方式只能在安装了RCH驱动的Windows电脑上运行": ["MultiDriver mode can run only on a Windows computer with the RCH driver installed", "La modalità MultiDriver può essere eseguita solo su un computer Windows con il driver RCH installato", "El modo MultiDriver solo puede ejecutarse en un ordenador Windows con el controlador RCH instalado", "O modo MultiDriver só pode ser executado num computador Windows com o controlador RCH instalado"],
  "请在本机配置中设置RCH驱动的绝对目录": ["Set the absolute path of the RCH driver directory in the local configuration", "Impostare il percorso assoluto della cartella del driver RCH nella configurazione locale", "Configure la ruta absoluta de la carpeta del controlador RCH en la configuración local", "Defina o caminho absoluto da pasta do controlador RCH na configuração local"],
  "固定MultiDriver程序不存在": ["The required MultiDriver executable does not exist", "L’eseguibile MultiDriver richiesto non esiste", "El ejecutable MultiDriver requerido no existe", "O executável MultiDriver necessário não existe"],
  "驱动PATH_IN与PATH_OUT必须是绝对路径": ["The driver’s PATH_IN and PATH_OUT must be absolute paths", "PATH_IN e PATH_OUT del driver devono essere percorsi assoluti", "PATH_IN y PATH_OUT del controlador deben ser rutas absolutas", "PATH_IN e PATH_OUT do controlador têm de ser caminhos absolutos"],
  "驱动目录已有scontrino.inp或scontrino.out；请先人工核查，程序不会覆盖或重放": ["The driver directory already contains scontrino.inp or scontrino.out; check it manually first. The program will not overwrite the files or replay the commands", "La cartella del driver contiene già scontrino.inp o scontrino.out; effettuare prima una verifica manuale. Il programma non sovrascriverà i file né ripeterà i comandi", "La carpeta del controlador ya contiene scontrino.inp o scontrino.out; revísela manualmente primero. El programa no sobrescribirá los archivos ni volverá a ejecutar los comandos", "A pasta do controlador já contém scontrino.inp ou scontrino.out; verifique-a manualmente primeiro. O programa não substituirá os ficheiros nem voltará a executar os comandos"],
  "MultiDriver异常退出或超时，动作结果未知；目录已锁定，请人工核查，禁止自动重发": ["MultiDriver exited abnormally or timed out; the action result is unknown. The directory is locked. Check manually; automatic resending is prohibited", "MultiDriver è terminato in modo anomalo o ha superato il timeout; l’esito dell’azione è sconosciuto. La cartella è bloccata. Verificare manualmente; il reinvio automatico è vietato", "MultiDriver ha finalizado de forma anómala o ha agotado el tiempo de espera; se desconoce el resultado de la acción. La carpeta está bloqueada. Revise manualmente; se prohíbe el reenvío automático", "MultiDriver terminou de forma anómala ou excedeu o tempo limite; o resultado da ação é desconhecido. A pasta está bloqueada. Verifique manualmente; o reenvio automático é proibido"],
  "MultiDriver已结束，但尚无该版本scontrino.out的确认规则；请核对设备实际结果，不要自动重发": ["MultiDriver has finished, but no confirmation rules are available for this version of scontrino.out. Check the actual device result; do not resend automatically", "MultiDriver è terminato, ma non sono ancora disponibili regole di conferma per questa versione di scontrino.out. Verificare l’esito effettivo sul dispositivo; non reinviare automaticamente", "MultiDriver ha finalizado, pero aún no hay reglas de confirmación para esta versión de scontrino.out. Compruebe el resultado real en el dispositivo; no reenvíe automáticamente", "MultiDriver terminou, mas ainda não existem regras de confirmação para esta versão de scontrino.out. Verifique o resultado real no dispositivo; não reenvie automaticamente"],
  "未确认设备处于空闲且非编程模式，未发送开箱命令": ["The device could not be confirmed as idle and outside programming mode; the drawer-opening command was not sent", "Non è stato possibile confermare che il dispositivo fosse inattivo e fuori dalla modalità di programmazione; il comando di apertura del cassetto non è stato inviato", "No se ha podido confirmar que el dispositivo esté inactivo y fuera del modo de programación; no se ha enviado el comando de apertura del cajón", "Não foi possível confirmar que o dispositivo estivesse inativo e fora do modo de programação; o comando de abertura da gaveta não foi enviado"],
  "本机设备请求过多，请等待当前动作完成": ["Too many local device requests; wait for the current action to finish", "Troppe richieste al dispositivo locale; attendere il completamento dell’azione corrente", "Hay demasiadas solicitudes al dispositivo local; espere a que termine la acción actual", "Existem demasiados pedidos ao dispositivo local; aguarde a conclusão da ação atual"],
  "开箱请求记录损坏，已禁止重发；请人工核查": ["The drawer-opening request record is corrupted; resending is blocked. Check manually", "Il record della richiesta di apertura del cassetto è danneggiato; il reinvio è bloccato. Verificare manualmente", "El registro de la solicitud de apertura del cajón está dañado; el reenvío está bloqueado. Revise manualmente", "O registo do pedido de abertura da gaveta está danificado; o reenvio está bloqueado. Verifique manualmente"],
  "同一开箱请求ID不能用于不同连接参数": ["The same drawer-opening request ID cannot be used with different connection parameters", "Lo stesso ID di richiesta di apertura del cassetto non può essere utilizzato con parametri di connessione diversi", "El mismo ID de solicitud de apertura del cajón no puede utilizarse con parámetros de conexión diferentes", "O mesmo ID de pedido de abertura da gaveta não pode ser utilizado com parâmetros de ligação diferentes"],
  "开箱请求结果记录损坏，已禁止重发；请人工核查": ["The drawer-opening request result record is corrupted; resending is blocked. Check manually", "Il record dell’esito della richiesta di apertura del cassetto è danneggiato; il reinvio è bloccato. Verificare manualmente", "El registro del resultado de la solicitud de apertura del cajón está dañado; el reenvío está bloqueado. Revise manualmente", "O registo do resultado do pedido de abertura da gaveta está danificado; o reenvio está bloqueado. Verifique manualmente"],
  "此开箱请求已登记，可能曾执行或中途终止；不会再次发送，请核对钱箱": ["This drawer-opening request is already recorded and may have been executed or interrupted. It will not be sent again; check the cash drawer", "Questa richiesta di apertura del cassetto è già registrata e potrebbe essere stata eseguita o interrotta. Non verrà inviata di nuovo; verificare il cassetto portadenaro", "Esta solicitud de apertura del cajón ya está registrada y podría haberse ejecutado o interrumpido. No se enviará de nuevo; compruebe el cajón portamonedas", "Este pedido de abertura da gaveta já está registado e pode ter sido executado ou interrompido. Não será enviado novamente; verifique a gaveta de dinheiro"],
  "本机设备执行异常，结果未知；不会自动重发": ["An error occurred during local device execution; the result is unknown. No automatic resending will occur", "Si è verificato un errore durante l’esecuzione sul dispositivo locale; l’esito è sconosciuto. Non verrà effettuato alcun reinvio automatico", "Se ha producido un error durante la ejecución en el dispositivo local; se desconoce el resultado. No se reenviará automáticamente", "Ocorreu um erro durante a execução no dispositivo local; o resultado é desconhecido. Não haverá reenvio automático"],
  "无法保存最终开箱结果；已保留禁止重发记录，请人工核查": ["The final drawer-opening result could not be saved. The record blocking resending has been retained; check manually", "Impossibile salvare l’esito finale dell’apertura del cassetto. Il record che blocca il reinvio è stato conservato; verificare manualmente", "No se ha podido guardar el resultado final de la apertura del cajón. Se ha conservado el registro que bloquea el reenvío; revise manualmente", "Não foi possível guardar o resultado final da abertura da gaveta. O registo que bloqueia o reenvio foi mantido; verifique manualmente"],
  "只允许指定的本机地址": ["Only the designated local address is allowed", "È consentito solo l’indirizzo locale specificato", "Solo se permite la dirección local especificada", "Só é permitido o endereço local especificado"],
  "请求包含重复的安全相关标头": ["The request contains duplicate security-related headers", "La richiesta contiene intestazioni di sicurezza duplicate", "La solicitud contiene encabezados de seguridad duplicados", "O pedido contém cabeçalhos de segurança duplicados"],
  "此POS来源未获本机授权": ["This POS origin is not authorized on this computer", "Questa origine POS non è autorizzata su questo computer", "Este origen del POS no está autorizado en este ordenador", "Esta origem do POS não está autorizada neste computador"],
  "接口不存在": ["Endpoint not found", "Endpoint non trovato", "Endpoint no encontrado", "Endpoint não encontrado"],
  "只允许POST请求": ["Only POST requests are allowed", "Sono consentite solo richieste POST", "Solo se permiten solicitudes POST", "Só são permitidos pedidos POST"],
  "不允许的请求标头": ["Request header not allowed", "Intestazione della richiesta non consentita", "Encabezado de solicitud no permitido", "Cabeçalho do pedido não permitido"],
  "配对码无效": ["Invalid pairing code", "Codice di abbinamento non valido", "Código de emparejamiento no válido", "Código de emparelhamento inválido"],
  "仅接受UTF-8 application/json": ["Only UTF-8 application/json is accepted", "È accettato solo application/json in UTF-8", "Solo se acepta application/json en UTF-8", "Só é aceite application/json em UTF-8"],
  "请求内容过大": ["The request body is too large", "Il corpo della richiesta è troppo grande", "El cuerpo de la solicitud es demasiado grande", "O corpo do pedido é demasiado grande"],
  "请求不是有效的UTF-8 JSON": ["The request is not valid UTF-8 JSON", "La richiesta non è un JSON UTF-8 valido", "La solicitud no es un JSON UTF-8 válido", "O pedido não é um JSON UTF-8 válido"],
  "本地连接程序发生错误，请检查本机配置与权限": ["The local bridge encountered an error; check the local configuration and permissions", "Si è verificato un errore nel programma di connessione locale; verificare la configurazione e le autorizzazioni locali", "Se ha producido un error en el programa de conexión local; compruebe la configuración y los permisos locales", "Ocorreu um erro no programa de ligação local; verifique a configuração e as permissões locais"],
  "设备": ["Device", "Dispositivo", "Dispositivo", "Dispositivo"],
  "设备设置": ["Device settings", "Impostazioni dispositivi", "Configuración de dispositivos", "Definições dos dispositivos"],
  "开钱箱": ["Open cash drawer", "Apri cassetto", "Abrir cajón", "Abrir gaveta"],
  "RCH Web Service（网络）": ["RCH Web Service (network)", "RCH Web Service (rete)", "RCH Web Service (red)", "RCH Web Service (rede)"],
  "RCH MultiDriver（网络）": ["RCH MultiDriver (network)", "RCH MultiDriver (rete)", "RCH MultiDriver (red)", "RCH MultiDriver (rede)"],
  "RCH MultiDriver（串口 / USB 转串口）": ["RCH MultiDriver (serial / USB-to-serial)", "RCH MultiDriver (seriale / USB-seriale)", "RCH MultiDriver (serie / USB a serie)", "RCH MultiDriver (série / USB para série)"],
  "命令行": ["Command line", "Riga comando", "Línea de comando", "Linha de comando"],
  "不使用第二行": ["Do not use a second line", "Non usare la seconda riga", "No usar segunda línea", "Não utilizar a segunda linha"],
  "无校验（N）": ["None (N)", "Nessuna (N)", "Sin paridad (N)", "Sem paridade (N)"],
  "偶校验（E）": ["Even (E)", "Pari (E)", "Par (E)", "Par (E)"],
  "奇校验（O）": ["Odd (O)", "Dispari (O)", "Impar (O)", "Ímpar (O)"],
  "设备执行结果未知": ["Device outcome unknown", "Esito del dispositivo sconosciuto", "Resultado del dispositivo desconocido", "Resultado do dispositivo desconhecido"],
  "设备操作未完成": ["Device operation not completed", "Operazione del dispositivo non completata", "Operación del dispositivo no completada", "Operação do dispositivo não concluída"],
  "设备已确认指令": ["Device acknowledged the command", "Comando confermato dal dispositivo", "El dispositivo ha confirmado el comando", "O dispositivo confirmou o comando"],
  "指令已送出，设备结果待核实": ["Command sent; verify the device outcome", "Comando inviato; verificare l’esito sul dispositivo", "Comando enviado; verifique el resultado en el dispositivo", "Comando enviado; confirme o resultado no dispositivo"],
  "设备模式": ["Device mode", "Modalità dispositivo", "Modo del dispositivo", "Modo do dispositivo"],
  "事务状态代码": ["Transaction status code", "Codice stato transazione", "Código de estado de transacción", "Código de estado da transação"],
  "缺纸": ["Out of paper", "Carta esaurita", "Sin papel", "Sem papel"],
  "是": ["Yes", "Sì", "Sí", "Sim"],
  "否": ["No", "No", "No", "Não"],
  "机盖打开": ["Cover open", "Coperchio aperto", "Tapa abierta", "Tampa aberta"],
  "设备忙碌": ["Device busy", "Dispositivo occupato", "Dispositivo ocupado", "Dispositivo ocupado"],
  "设备设置已保存": ["Device settings saved", "Impostazioni dispositivi salvate", "Configuración de dispositivos guardada", "Definições dos dispositivos guardadas"],
  "测试开箱": ["Test cash drawer", "Prova apertura cassetto", "Probar apertura del cajón", "Testar abertura da gaveta"],
  "将向当前配置的钱箱发送一次开箱指令。请确认现场可以安全开箱，并观察钱箱是否实际弹开。": ["One open command will be sent to the configured cash drawer. Make sure it is safe to open and check whether the drawer physically opens.", "Verrà inviato un solo comando di apertura al cassetto configurato. Assicurarsi che l’apertura sia sicura e verificare che il cassetto si apra fisicamente.", "Se enviará un comando de apertura al cajón configurado. Compruebe que puede abrirse con seguridad y observe si se abre físicamente.", "Será enviado um comando de abertura à gaveta configurada. Confirme que é seguro abri-la e verifique se a gaveta abre fisicamente."],
  "发送开箱指令": ["Send open command", "Invia comando di apertura", "Enviar comando de apertura", "Enviar comando de abertura"],
  "启用本机设备": ["Enable local devices", "Abilita dispositivi locali", "Activar dispositivos locales", "Ativar dispositivos locais"],
  "设置仅保存在当前浏览器，单机版也可使用，无需连接云端。保存后应用于日常收银。": ["Settings are stored only in this browser. Standalone mode is supported without a cloud connection. Save to apply them during checkout.", "Le impostazioni sono salvate solo in questo browser. La modalità locale è supportata senza connessione al cloud. Salvare per applicarle alle operazioni di cassa.", "La configuración se guarda solo en este navegador. Funciona en modo local sin conexión a la nube. Guárdela para aplicarla durante el cobro.", "As definições são guardadas apenas neste navegador. O modo local funciona sem ligação à nuvem. Guarde para as aplicar durante os pagamentos."],
  "本机连接": ["Local connection", "Connessione locale", "Conexión local", "Ligação local"],
  "先在 Windows 收银电脑运行 hardware/start.cmd，保持本地连接程序运行。使用 MultiDriver 时，在该程序中配置驱动文件夹。": ["Run hardware/start.cmd on the Windows checkout computer and keep the local bridge running. For MultiDriver, configure the driver folder in that program.", "Eseguire hardware/start.cmd sul PC Windows della cassa e lasciare attivo il programma di connessione locale. Per MultiDriver, configurare la cartella del driver nel programma.", "Ejecute hardware/start.cmd en el equipo Windows de caja y mantenga activo el programa de conexión local. Para MultiDriver, configure la carpeta del controlador en ese programa.", "Execute hardware/start.cmd no computador Windows da caixa e mantenha o programa de ligação local em execução. Para MultiDriver, configure a pasta do controlador nesse programa."],
  "本地连接地址": ["Local bridge URL", "Indirizzo connessione locale", "Dirección de conexión local", "Endereço de ligação local"],
  "配对码": ["Pairing code", "Codice di abbinamento", "Código de emparejamiento", "Código de emparelhamento"],
  "填写本地连接程序显示的配对码": ["Enter the pairing code shown by the local bridge", "Inserire il codice mostrato dal programma di connessione locale", "Introduzca el código mostrado por el programa de conexión local", "Introduza o código apresentado pelo programa de ligação local"],
  "连接方式": ["Connection type", "Tipo di connessione", "Tipo de conexión", "Tipo de ligação"],
  "设备 IP 地址": ["Device IP address", "Indirizzo IP del dispositivo", "Dirección IP del dispositivo", "Endereço IP do dispositivo"],
  "填写设备实际 IP 地址": ["Enter the device’s actual IP address", "Inserire l’indirizzo IP effettivo del dispositivo", "Introduzca la dirección IP real del dispositivo", "Introduza o endereço IP real do dispositivo"],
  "设备端口": ["Device port", "Porta del dispositivo", "Puerto del dispositivo", "Porta do dispositivo"],
  "Web Service 路径": ["Web Service path", "Percorso Web Service", "Ruta de Web Service", "Caminho do Web Service"],
  "按设备手册填写，以 / 开头": ["Enter the path from the device manual, starting with /", "Inserire il percorso indicato nel manuale, iniziando con /", "Introduzca la ruta del manual del dispositivo, empezando por /", "Introduza o caminho indicado no manual, começando por /"],
  "IP、端口和路径须与设备当前配置一致，不确定时请先向设备服务商确认。": ["The IP address, port and path must match the device’s current configuration. If unsure, check with your device service provider first.", "Indirizzo IP, porta e percorso devono corrispondere alla configurazione attuale del dispositivo. In caso di dubbio, chiedere prima al fornitore di assistenza.", "La IP, el puerto y la ruta deben coincidir con la configuración actual del dispositivo. En caso de duda, consulte primero al proveedor de asistencia.", "O IP, a porta e o caminho têm de corresponder à configuração atual do dispositivo. Em caso de dúvida, confirme primeiro com o fornecedor de assistência."],
  "COM 端口号": ["COM port number", "Numero porta COM", "Número de puerto COM", "Número da porta COM"],
  "只填数字，例如 COM3 填 3。USB 转串口请先查看 Windows 设备管理器。": ["Enter only the number: for COM3, enter 3. For USB-to-serial, check Windows Device Manager first.", "Inserire solo il numero: per COM3, inserire 3. Per USB-seriale, controllare prima Gestione dispositivi di Windows.", "Introduzca solo el número: para COM3, escriba 3. Para USB a serie, consulte primero el Administrador de dispositivos de Windows.", "Introduza apenas o número: para COM3, indique 3. Para USB para série, consulte primeiro o Gestor de Dispositivos do Windows."],
  "波特率": ["Baud rate", "Velocità in baud", "Velocidad en baudios", "Velocidade em baud"],
  "校验位": ["Parity", "Parità", "Paridad", "Paridade"],
  "数据位": ["Data bits", "Bit di dati", "Bits de datos", "Bits de dados"],
  "停止位": ["Stop bits", "Bit di stop", "Bits de parada", "Bits de paragem"],
  "响应超时（毫秒）": ["Response timeout (ms)", "Timeout risposta (ms)", "Tiempo de espera de respuesta (ms)", "Tempo limite de resposta (ms)"],
  "正在检测…": ["Checking…", "Verifica in corso…", "Comprobando…", "A verificar…"],
  "连接检测": ["Check connection", "Verifica connessione", "Comprobar conexión", "Verificar ligação"],
  "检测和测试使用当前填写的参数，无需先保存。": ["Checks and tests use the values currently entered; saving first is not required.", "Verifiche e prove usano i valori attualmente inseriti; non è necessario salvarli prima.", "Las comprobaciones y pruebas usan los valores introducidos; no hace falta guardarlos antes.", "As verificações e os testes utilizam os valores introduzidos; não é necessário guardar primeiro."],
  "钱箱": ["Cash drawer", "Cassetto portadenaro", "Cajón portamonedas", "Gaveta de dinheiro"],
  "启用钱箱": ["Enable cash drawer", "Abilita cassetto", "Activar cajón", "Ativar gaveta"],
  "现金结算成功后自动开箱": ["Open automatically after a successful cash payment", "Apri automaticamente dopo un pagamento in contanti riuscito", "Abrir automáticamente tras un pago en efectivo completado", "Abrir automaticamente após um pagamento em numerário concluído"],
  "开箱前设备必须处于单据已关闭且非 PRG 模式。请观察钱箱是否实际弹开；指令返回不代表开合传感器状态。": ["Before opening, the device must have no open document and must not be in PRG mode. Check that the drawer physically opens; a command response is not a drawer sensor reading.", "Prima dell’apertura, il documento deve essere chiuso e il dispositivo non deve essere in modalità PRG. Verificare l’apertura fisica: la risposta al comando non indica lo stato del sensore del cassetto.", "Antes de abrir, el documento debe estar cerrado y el dispositivo no debe estar en modo PRG. Compruebe la apertura física; la respuesta al comando no indica el estado del sensor del cajón.", "Antes de abrir, o documento deve estar fechado e o dispositivo não pode estar no modo PRG. Verifique a abertura física; a resposta ao comando não indica o estado do sensor da gaveta."],
  "正在测试…": ["Testing…", "Prova in corso…", "Probando…", "A testar…"],
  "客显": ["Customer display", "Display cliente", "Visor del cliente", "Visor do cliente"],
  "启用客显": ["Enable customer display", "Abilita display cliente", "Activar visor del cliente", "Ativar visor do cliente"],
  "自动显示商品、合计和找零": ["Automatically show items, total and change", "Mostra automaticamente articoli, totale e resto", "Mostrar automáticamente artículos, total y cambio", "Mostrar automaticamente artigos, total e troco"],
  "当前支持每行最多 20 个 ASCII 字符，不支持斜杠和括号。中文商品名优先显示条码，无条码时显示商品编码；均不可用时显示 ITEM。": ["Up to 20 ASCII characters per line; slashes and parentheses are not supported. Chinese item names use the barcode, then the item code if no barcode is available, or ITEM if neither is usable.", "Massimo 20 caratteri ASCII per riga; barre e parentesi non sono supportate. Per i nomi cinesi si usa il codice a barre, poi il codice articolo se manca; se nessuno è utilizzabile, si mostra ITEM.", "Máximo 20 caracteres ASCII por línea; no se admiten barras ni paréntesis. Los nombres chinos usan el código de barras, después el código de artículo si no hay código de barras, o ITEM si ninguno es válido.", "Até 20 caracteres ASCII por linha; barras e parênteses não são suportados. Os nomes chineses usam o código de barras, depois o código do artigo se não houver código de barras, ou ITEM se nenhum for utilizável."],
  "单行模式只显示合计（TOTAL）和付款后的找零（CHANGE）；启用第二行后，收银时第一行显示商品，第二行显示合计。": ["Single-line mode shows TOTAL during checkout and CHANGE after payment. With a second line enabled, checkout shows the item on the first line and the total on the second.", "La modalità a una riga mostra solo TOTAL e, dopo il pagamento, CHANGE. Con la seconda riga abilitata, durante la vendita la prima mostra l’articolo e la seconda il totale.", "El modo de una línea solo muestra TOTAL y, tras el pago, CHANGE. Al activar la segunda línea, durante la venta la primera muestra el artículo y la segunda el total.", "O modo de uma linha mostra apenas TOTAL e, após o pagamento, CHANGE. Com a segunda linha ativa, durante a venda a primeira mostra o artigo e a segunda o total."],
  "第一行命令映射": ["First display line mapping", "Mappatura prima riga", "Asignación de la primera línea", "Mapeamento da primeira linha"],
  "第二行命令映射": ["Second display line mapping", "Mappatura seconda riga", "Asignación de la segunda línea", "Mapeamento da segunda linha"],
  "默认不使用第二行。D2 涉及操作员显示，D3 受型号和固件限制，请按现场确认的客显映射选择。": ["The second line is disabled by default. D2 relates to the operator display; D3 depends on the model and firmware. Select only a mapping verified on your device.", "La seconda riga è disabilitata per impostazione predefinita. D2 riguarda il display operatore; D3 dipende da modello e firmware. Selezionare solo una mappatura verificata sul dispositivo.", "La segunda línea está desactivada por defecto. D2 corresponde al visor del operador; D3 depende del modelo y firmware. Seleccione solo una asignación comprobada en su dispositivo.", "A segunda linha está desativada por predefinição. D2 está relacionado com o visor do operador; D3 depende do modelo e do firmware. Selecione apenas um mapeamento confirmado no dispositivo."],
  "欢迎文字第一行": ["Welcome text, first line", "Testo di benvenuto, prima riga", "Texto de bienvenida, primera línea", "Texto de boas-vindas, primeira linha"],
  "欢迎文字第二行": ["Welcome text, second line", "Testo di benvenuto, seconda riga", "Texto de bienvenida, segunda línea", "Texto de boas-vindas, segunda linha"],
  "测试客显": ["Test customer display", "Prova display cliente", "Probar visor del cliente", "Testar visor do cliente"],
  "测试将发送上面的欢迎文字，请核对现场显示内容。": ["The test sends the welcome text above. Check what appears on the physical display.", "La prova invia il testo di benvenuto indicato sopra. Verificare il contenuto sul display fisico.", "La prueba envía el texto de bienvenida anterior. Compruebe el contenido del visor físico.", "O teste envia o texto de boas-vindas acima. Confirme o conteúdo no visor físico."],
  "最近一次设备返回": ["Latest device response", "Ultima risposta del dispositivo", "Última respuesta del dispositivo", "Última resposta do dispositivo"],
  "原始设备返回": ["Raw device response", "Risposta originale del dispositivo", "Respuesta original del dispositivo", "Resposta original do dispositivo"],
  "RCH 税控票与普通浏览器收据独立，本页只配置设备连接、钱箱和客显。": ["RCH fiscal receipts are separate from standard browser receipts. This page configures only device connections, the cash drawer and the customer display.", "I documenti fiscali RCH sono separati dalle normali ricevute del browser. Questa pagina configura solo connessioni, cassetto e display cliente.", "Los recibos fiscales RCH son independientes de los recibos normales del navegador. Esta página solo configura conexiones, cajón y visor del cliente.", "Os recibos fiscais RCH são independentes dos recibos normais do navegador. Esta página configura apenas ligações, gaveta e visor do cliente."],
  "有未保存的修改": ["Unsaved changes", "Modifiche non salvate", "Cambios sin guardar", "Alterações por guardar"],
  "设备设置已保存，仅对本机生效": ["Device settings saved for this computer only", "Impostazioni salvate solo per questo computer", "Configuración guardada solo para este equipo", "Definições guardadas apenas para este computador"],
  "保存后生效": ["Save to apply", "Salvare per applicare", "Guarde para aplicar", "Guarde para aplicar"],
  "设备设置格式不正确": ["Invalid device settings format", "Formato impostazioni dispositivi non valido", "Formato de configuración de dispositivos no válido", "Formato das definições dos dispositivos inválido"],
  "设备开关设置格式不正确": ["Invalid device enable/disable settings", "Impostazioni di attivazione dispositivi non valide", "Configuración de activación de dispositivos no válida", "Definições de ativação dos dispositivos inválidas"],
  "连接程序地址必须是本机 HTTP 地址": ["The bridge URL must be a local HTTP address", "L’indirizzo del programma di connessione deve essere un indirizzo HTTP locale", "La dirección del programa de conexión debe ser una dirección HTTP local", "O endereço do programa de ligação tem de ser um endereço HTTP local"],
  "请填写本地连接程序的配对码（至少 24 位）": ["Enter the local bridge pairing code (at least 24 characters)", "Inserire il codice di abbinamento locale (almeno 24 caratteri)", "Introduzca el código de emparejamiento local (al menos 24 caracteres)", "Introduza o código de emparelhamento local (pelo menos 24 caracteres)"],
  "请选择有效的设备连接方式": ["Select a valid device connection type", "Selezionare un tipo di connessione valido", "Seleccione un tipo de conexión de dispositivo válido", "Selecione um tipo de ligação de dispositivo válido"],
  "请填写设备的局域网 IPv4 地址": ["Enter the device’s local network IPv4 address", "Inserire l’indirizzo IPv4 del dispositivo nella rete locale", "Introduzca la dirección IPv4 del dispositivo en la red local", "Introduza o endereço IPv4 do dispositivo na rede local"],
  "设备端口须为 1 至 65535": ["Device port must be between 1 and 65535", "La porta del dispositivo deve essere compresa tra 1 e 65535", "El puerto del dispositivo debe estar entre 1 y 65535", "A porta do dispositivo tem de estar entre 1 e 65535"],
  "请按设备文档填写 Web Service 路径（以 / 开头）": ["Enter the Web Service path from the device documentation (starting with /)", "Inserire il percorso Web Service indicato nella documentazione (iniziando con /)", "Introduzca la ruta de Web Service de la documentación del dispositivo (empezando por /)", "Introduza o caminho do Web Service indicado na documentação (começando por /)"],
  "串口参数不正确": ["Invalid serial port settings", "Parametri della porta seriale non validi", "Parámetros del puerto serie no válidos", "Parâmetros da porta série inválidos"],
  "设备超时须为 1000 至 30000 毫秒": ["Device timeout must be between 1000 and 30000 ms", "Il timeout del dispositivo deve essere compreso tra 1000 e 30000 ms", "El tiempo de espera del dispositivo debe estar entre 1000 y 30000 ms", "O tempo limite do dispositivo tem de estar entre 1000 e 30000 ms"],
  "请选择不同的客显命令行": ["Select different command lines for the customer display", "Selezionare righe comando diverse per il display cliente", "Seleccione líneas de comando distintas para el visor del cliente", "Selecione linhas de comando diferentes para o visor do cliente"],
  "客显文字限 20 位英文、数字及符号，不支持中文、斜杠和括号": ["Display text is limited to 20 ASCII letters, digits or symbols; Chinese, slashes and parentheses are not supported", "Il testo del display è limitato a 20 lettere, cifre o simboli ASCII; cinese, barre e parentesi non sono supportati", "El texto del visor admite hasta 20 letras, dígitos o símbolos ASCII; no admite chino, barras ni paréntesis", "O texto do visor permite até 20 letras, algarismos ou símbolos ASCII; não suporta chinês, barras nem parênteses"],
  "请先启用设备连接": ["Enable the device connection first", "Abilitare prima la connessione del dispositivo", "Active primero la conexión del dispositivo", "Ative primeiro a ligação do dispositivo"],
  "请先启用钱箱": ["Enable the cash drawer first", "Abilitare prima il cassetto", "Active primero el cajón", "Ative primeiro a gaveta"],
  "请先启用客显": ["Enable the customer display first", "Abilitare prima il display cliente", "Active primero el visor del cliente", "Ative primeiro o visor do cliente"],
  "设备连接程序响应格式不正确": ["Invalid response format from the device bridge", "Formato di risposta del programma di connessione non valido", "Formato de respuesta del programa de conexión no válido", "Formato de resposta do programa de ligação inválido"],
  "设备连接失败或超时，结果待确认；请检查本地连接程序，勿重复开箱": ["Device connection failed or timed out; the outcome is unconfirmed. Check the local bridge and do not repeat the drawer opening.", "Connessione al dispositivo non riuscita o scaduta; esito da confermare. Controllare il programma locale e non ripetere l’apertura del cassetto.", "La conexión falló o agotó el tiempo de espera; resultado sin confirmar. Revise el programa local y no repita la apertura del cajón.", "A ligação falhou ou excedeu o tempo limite; resultado por confirmar. Verifique o programa local e não repita a abertura da gaveta."],
  "收款已完成，设备动作未自动重试；请检查设备及本机存储": ["Payment completed. Device actions were not automatically retried; check the device and local storage.", "Pagamento completato. Le azioni del dispositivo non sono state ripetute automaticamente; controllare dispositivo e memoria locale.", "Pago completado. No se han reintentado automáticamente las acciones del dispositivo; revise el dispositivo y el almacenamiento local.", "Pagamento concluído. As ações do dispositivo não foram repetidas automaticamente; verifique o dispositivo e o armazenamento local."],
  "收款已完成，设备操作结果未确认，请检查设备": ["Payment completed, but the device outcome is unconfirmed. Check the device.", "Pagamento completato, ma l’esito del dispositivo non è confermato. Controllare il dispositivo.", "Pago completado, pero el resultado del dispositivo no está confirmado. Revise el dispositivo.", "Pagamento concluído, mas o resultado do dispositivo não está confirmado. Verifique o dispositivo."],
  "设备报告错误（errorCode={0}, printerError={1}）；不会自动重试": ["Device reported an error (errorCode={0}, printerError={1}); no automatic retry", "Il dispositivo ha segnalato un errore (errorCode={0}, printerError={1}); nessun nuovo tentativo automatico", "El dispositivo notificó un error (errorCode={0}, printerError={1}); no se reintentará automáticamente", "O dispositivo comunicou um erro (errorCode={0}, printerError={1}); não haverá repetição automática"],
  "设备返回HTTP {0}，执行结果未知；不跟随重定向，不自动重试": ["Device returned HTTP {0}; outcome unknown. Redirects are not followed and no automatic retry will occur.", "Il dispositivo ha restituito HTTP {0}; esito sconosciuto. I reindirizzamenti non vengono seguiti e non sono previsti nuovi tentativi automatici.", "El dispositivo devolvió HTTP {0}; resultado desconocido. No se siguen redirecciones ni se reintenta automáticamente.", "O dispositivo devolveu HTTP {0}; resultado desconhecido. Não são seguidos redirecionamentos nem haverá repetição automática."],
  "变体图片": ["Variant image", "Immagine variante", "Imagen de variante"],
  "名称、分类和描述由所有变体共用。": ["All variants share the name, category and description.", "Nome, categoria e descrizione sono condivisi tra le varianti.", "Todas las variantes comparten nombre, categoría y descripción."],
  "商品变体": ["Product variants", "Varianti prodotto", "Variantes de producto"],
  "添加变体": ["Add variant", "Aggiungi variante", "Añadir variante"],
  "变体 {0}": ["Variant {0}", "Variante {0}", "Variante {0}"],
  "逐条添加实际销售的规格，条码由您录入或扫码填写。": ["Add each variant you sell. Enter or scan its barcode.", "Aggiungi ogni variante venduta. Inserisci o scansiona il codice a barre.", "Añada cada variante que vende. Introduzca o escanee su código de barras."],
  "更换图片": ["Change image", "Cambia immagine", "Cambiar imagen"],
  "属性": ["Attribute", "Attributo", "Atributo"],
  "添加属性": ["Add attribute", "Aggiungi attributo", "Añadir atributo"],
  "移除属性": ["Remove attribute", "Rimuovi attributo", "Eliminar atributo"],
  "例如：颜色": ["E.g. Color", "Es. Colore", "Ej. Color"],
  "例如：红色": ["E.g. Red", "Es. Rosso", "Ej. Rojo"],
  "可添加颜色、尺寸、口味等属性。": ["Add attributes such as color, size or flavor.", "Aggiungi attributi come colore, taglia o gusto.", "Añada atributos como color, talla o sabor."],
  "移除此未保存变体": ["Remove unsaved variant", "Rimuovi variante non salvata", "Eliminar variante sin guardar"],
  "下载变体模板": ["Download variant template", "Scarica modello varianti", "Descargar plantilla de variantes"],
  "导入变体": ["Import variants", "Importa varianti", "Importar variantes"],
  "请选择不超过 5MB 的 JPG、PNG 或 WebP 图片": ["Choose a JPG, PNG or WebP image up to 5MB", "Scegli un’immagine JPG, PNG o WebP fino a 5MB", "Elija una imagen JPG, PNG o WebP de hasta 5MB"],
  "请上传不超过 5MB 的 XLSX 文件": ["Upload an XLSX file up to 5MB", "Carica un file XLSX fino a 5MB", "Suba un archivo XLSX de hasta 5MB"],
  "表头不匹配，请使用变体模板": ["Headers do not match. Use the variant template.", "Intestazioni non valide. Usa il modello varianti.", "Las cabeceras no coinciden. Use la plantilla de variantes."],
  "请提供 1 至 100 条变体": ["Provide 1 to 100 variants", "Inserisci da 1 a 100 varianti", "Introduzca entre 1 y 100 variantes"],
  "条码和商品编码必须使用文本格式": ["Barcodes and product codes must use text format", "Codici a barre e codici prodotto devono essere in formato testo", "Los códigos de barras y producto deben tener formato de texto"],
  "售价须为有效金额，最多两位小数": ["Enter a valid price with up to two decimals", "Inserisci un prezzo valido con massimo due decimali", "Introduzca un precio válido con hasta dos decimales"],
  "每个变体最多 12 个属性": ["Up to 12 attributes per variant", "Massimo 12 attributi per variante", "Hasta 12 atributos por variante"],
  "请完整填写属性和属性值": ["Complete each attribute and its value", "Completa ogni attributo e il suo valore", "Complete cada atributo y su valor"],
  "同一变体不能重复填写属性": ["An attribute cannot appear twice in a variant", "Un attributo non può ripetersi nella stessa variante", "Un atributo no puede repetirse en una variante"],
  "属性组合或规格重复": ["Duplicate attribute combination or specification", "Combinazione di attributi o specifica duplicata", "Combinación de atributos o especificación duplicada"],
  "商品变体已变化，请重新打开编辑窗口": ["Variants have changed. Reopen the editor.", "Le varianti sono cambiate. Riapri la finestra di modifica.", "Las variantes han cambiado. Vuelva a abrir el editor."],
  "变体不存在或重复": ["Variant missing or duplicated", "Variante mancante o duplicata", "Variante inexistente o duplicada"],
  "变体数据格式不正确": ["Invalid variant data", "Dati variante non validi", "Datos de variante no válidos"],
  "变体标识重复": ["Duplicate variant identifier", "Identificatore variante duplicato", "Identificador de variante duplicado"],

  "日期范围": ["Date range", "Intervallo date", "Rango de fechas", "Intervalo de datas"],
  "今天": ["Today", "Oggi", "Hoy", "Hoje"],
  "昨天": ["Yesterday", "Ieri", "Ayer", "Ontem"],
  "近 7 天": ["Last 7 days", "Ultimi 7 giorni", "Últimos 7 días", "Últimos 7 dias"],
  "本月": ["This month", "Questo mese", "Este mes", "Este mês"],
  "扫描原小票，选择商品并填写原因。退款以现金退还。": ["Scan the receipt, select items and enter a reason. Refunds are paid in cash.", "Scansiona lo scontrino, seleziona gli articoli e indica il motivo. Rimborso in contanti.", "Escanee el recibo, seleccione artículos e indique el motivo. Reembolso en efectivo."],
  "扫描原小票二维码": ["Scan receipt QR code", "Scansiona QR dello scontrino", "Escanear QR del recibo"],
  "扫描退货商品条码": ["Scan returned product barcode", "Scansiona il codice articolo", "Escanear código del artículo"],
  "退货记录": ["Return records", "Registro resi", "Registro de devoluciones"],
  "退货单号": ["Return number", "Numero reso", "Número de devolución"],
  "退货原因": ["Return reason", "Motivo del reso", "Motivo de devolución"],
  "可退数量": ["Returnable quantity", "Quantità restituibile", "Cantidad disponible"],
  "退货数量": ["Return quantity", "Quantità resa", "Cantidad devuelta"],
  "现金退款": ["Cash refund", "Rimborso in contanti", "Reembolso en efectivo"],
  "确认退货并记录现金退款": ["Confirm return and cash refund", "Conferma reso e rimborso in contanti", "Confirmar devolución y reembolso"],
  "退货已完成": ["Return completed", "Reso completato", "Devolución completada"],
  "退货小票二维码": ["Return receipt QR code", "QR per il reso", "QR para devolución"],
  "退货时请出示此码": ["Show this code for returns", "Mostra questo codice per il reso", "Muestre este código para devoluciones"],
  "请选择退货商品并填写原因": ["Select items and enter a reason", "Seleziona gli articoli e indica il motivo", "Seleccione artículos e indique el motivo"],
  "核实原退货": ["Verify previous return", "Verifica il reso precedente", "Verificar devolución anterior"],
  "上次退货结果待确认，请重试原请求，勿重复退现金。": ["The previous return is unconfirmed. Retry verification; do not refund cash again.", "Il reso precedente è da verificare. Riprova senza rimborsare nuovamente.", "La devolución anterior está pendiente. Verifique sin volver a entregar efectivo."],
  "未找到唯一可退商品，请在列表选择": ["Select the item from the list", "Seleziona l’articolo nell’elenco", "Seleccione el artículo en la lista"],

  "该分类已有商品，不能添加下级分类": ["This category contains products and cannot have subcategories.", "Questa categoria contiene prodotti e non può avere sottocategorie.", "Esta categoría contiene productos y no puede tener subcategorías."],
  "收起菜单": ["Collapse menu", "Comprimi menu", "Contraer menú"],
  "展开菜单": ["Expand menu", "Espandi menu", "Expandir menú"],
  "收起": ["Collapse", "Comprimi", "Contraer"],
  "展开": ["Expand", "Espandi", "Expandir"],
  "全部分类": ["All categories", "Tutte le categorie", "Todas las categorías"],
  "全部收起": ["Collapse all", "Comprimi tutto", "Contraer todo"],
  "全部展开": ["Expand all", "Espandi tutto", "Expandir todo"],
  "单机尊享版": ["Standalone Premium", "Versione locale Premium", "Versión local Premium"],
  "连锁商户版": ["Chain Business Edition", "Versione per catene", "Versión para cadenas"],
  "用户与门店角色管理": ["Users and store roles", "Utenti e ruoli per negozio", "Usuarios y roles por tienda"],
  "集中管理多家门店": ["Manage multiple stores centrally", "Gestisci più negozi centralmente", "Gestione varias tiendas de forma centralizada"],
  "按门店分配员工与角色": ["Assign staff and roles by store", "Assegna personale e ruoli per negozio", "Asigne personal y roles por tienda"],
  "连接云端后，统一维护门店资料，并按权限切换和管理不同门店。": ["Connect to the cloud to maintain store details centrally and switch between stores according to your permissions.", "Collega il cloud per gestire i dati dei negozi e passare da un negozio all’altro secondo i tuoi permessi.", "Conecte la nube para mantener los datos de las tiendas y cambiar entre ellas según sus permisos."],
  "连接云端后，为用户分配多个门店及对应角色，管理各门店的操作权限。": ["Connect to the cloud to assign users to multiple stores with corresponding roles and permissions.", "Collega il cloud per assegnare agli utenti più negozi con i rispettivi ruoli e permessi.", "Conecte la nube para asignar usuarios a varias tiendas con sus roles y permisos."],
  "此功能需连接云端并使用有权限的账号。本机数据保留。": ["This feature requires a cloud connection and an authorized account. Local data is retained.", "Questa funzione richiede una connessione cloud e un account autorizzato. I dati locali vengono conservati.", "Esta función requiere conexión a la nube y una cuenta autorizada. Los datos locales se conservan."],
  "预览示例": ["Sample preview", "Anteprima di esempio", "Vista previa de ejemplo"],
  "修改即时预览，保存后生效。示例不生成订单。": ["Changes appear immediately; save to apply. This sample does not create an order.", "Le modifiche sono visibili subito; salva per applicarle. L’esempio non crea un ordine.", "Los cambios se muestran al instante; guarde para aplicarlos. El ejemplo no crea un pedido."],
  "小票设置": ["Receipt settings", "Impostazioni scontrino", "Configuración del recibo"],
  "小票设置已保存": ["Receipt settings saved", "Impostazioni scontrino salvate", "Configuración del recibo guardada"],
  "顶部字样": ["Header text", "Testo iniziale", "Texto del encabezado"],
  "底部字样": ["Footer text", "Testo finale", "Texto del pie"],
  "支持多行文字，留空则不显示。保存后应用于本机小票预览和打印。": ["Use multiple lines or leave blank to hide. Saved text appears in local receipt previews and prints.", "Usa più righe o lascia vuoto per nascondere. Il testo salvato appare nelle anteprime e nelle stampe locali.", "Use varias líneas o deje vacío para ocultar. El texto guardado aparece en la vista previa y en la impresión local."],
  "当日订单流水已用完": ["Daily order sequence exhausted", "Sequenza giornaliera esaurita", "Secuencia diaria agotada"],
  "订单编号格式不正确": ["Invalid order number format", "Formato numero ordine non valido", "Formato de número de pedido no válido"],
  "订单编号重复，请核对后导入": ["Duplicate order numbers. Check before importing.", "Numeri ordine duplicati. Verifica prima di importare.", "Números de pedido duplicados. Revise antes de importar."],
  "升级开通": ["Upgrade", "Upgrade", "Upgrade"],
  "累计消费": ["Cumulative spending", "Spesa cumulativa", "Gasto acumulado"],
  "优惠合计": ["Total discount", "Sconto totale", "Descuento total"],
  "会员流水": ["Member transactions", "Movimenti soci", "Movimientos de socios"],
  "备份包含会员规则、积分、余额及等级流水；恢复不会再次充值或扣款。": ["Backups include member rules, points, balance and tier history. Restoring does not repeat top-ups or charges.", "I backup includono regole soci, punti, saldi e cronologia livelli. Il ripristino non ripete ricariche o addebiti.", "Las copias incluyen reglas, puntos, saldos e historial de niveles. Restaurar no repite recargas ni cargos."],
  "会员优惠已变化，请重新核算后确认": ["Member benefits changed. Recalculate before confirming.", "I vantaggi sono cambiati. Ricalcola prima di confermare.", "Los beneficios han cambiado. Recalcule antes de confirmar."],
  "等级方式": ["Tier mode", "Modalità livello", "Modo de nivel"],
  "手动指定": ["Manually assigned", "Assegnato manualmente", "Asignado manualmente"],
  "会员设置": ["Member settings", "Impostazioni soci", "Configuración de socios"],
  "会员设置已保存": ["Member settings saved", "Impostazioni soci salvate", "Configuración de socios guardada"],
  "积分规则": ["Points rules", "Regole punti", "Reglas de puntos"],
  "每消费 1 单位金额获得积分": ["Points earned per currency unit spent", "Punti per unità di valuta spesa", "Puntos por unidad monetaria gastada"],
  "抵扣 1 单位金额所需积分": ["Points required per currency unit redeemed", "Punti per unità di valuta riscattata", "Puntos por unidad monetaria canjeada"],
  "最高抵扣比例（%）": ["Maximum redemption (%)", "Limite di riscatto (%)", "Canje máximo (%)"],
  "消费积分按折扣及积分抵扣后的实付金额向下取整；充值不送积分。填 0 可关闭对应积分功能。": ["Points are rounded down from the amount paid after discounts and redemption. Top-ups earn no points. Enter 0 to disable the corresponding feature.", "I punti sono arrotondati per difetto sul pagato dopo sconti e riscatti. Le ricariche non danno punti. Inserisci 0 per disattivare la relativa funzione.", "Los puntos se redondean hacia abajo sobre el importe pagado tras descuentos y canjes. Las recargas no generan puntos. Introduzca 0 para desactivar la función correspondiente."],
  "新增等级": ["Add tier", "Aggiungi livello", "Añadir nivel"],
  "等级名称": ["Tier name", "Nome livello", "Nombre del nivel"],
  "累计消费门槛": ["Cumulative spending threshold", "Soglia di spesa cumulativa", "Umbral de gasto acumulado"],
  "实付比例（%）": ["Price payable (%)", "Prezzo da pagare (%)", "Precio a pagar (%)"],
  "按累计实付消费自动升级；首级门槛为 0。实付比例 100 表示原价，90 表示九折。规则仅影响后续结算。": ["Tiers upgrade by cumulative paid spending. The first threshold must be 0. A payable percentage of 100 means full price; 90 means 10% off. Changes apply to future sales.", "Il livello aumenta con la spesa pagata cumulativa. La prima soglia deve essere 0. La percentuale 100 indica prezzo pieno, 90 uno sconto del 10%. Le modifiche valgono per vendite future.", "Los niveles aumentan según el gasto pagado acumulado. El primer umbral debe ser 0. El 100 indica precio completo y el 90 un descuento del 10%. Los cambios se aplican a ventas futuras."],
  "移除": ["Remove", "Rimuovi", "Quitar"],
  "调整积分": ["Adjust points", "Modifica punti", "Ajustar puntos"],
  "调整等级": ["Change tier", "Cambia livello", "Cambiar nivel"],
  "现金充值金额": ["Cash top-up amount", "Importo ricarica in contanti", "Importe de recarga en efectivo"],
  "积分增减数量": ["Points adjustment", "Variazione punti", "Variación de puntos"],
  "自动等级": ["Automatic tier", "Livello automatico", "Nivel automático"],
  "操作原因": ["Reason", "Motivo", "Motivo"],
  "请确认已收到现金，确认后立即计入会员余额。": ["Confirm that cash has been received. The member balance will be credited immediately.", "Conferma di aver ricevuto i contanti. Il saldo sarà accreditato subito.", "Confirme que ha recibido el efectivo. El saldo se abonará inmediatamente."],
  "正数增加积分，负数扣减积分；不能扣成负数。": ["Positive values add points; negative values deduct them. The balance cannot fall below zero.", "I valori positivi aggiungono punti, quelli negativi li sottraggono. Il saldo non può scendere sotto zero.", "Los valores positivos añaden puntos y los negativos los descuentan. El saldo no puede quedar por debajo de cero."],
  "选择自动等级后，按累计消费门槛评定；手动指定的等级不自动升级。": ["Automatic tiers use cumulative spending thresholds. Manually assigned tiers do not upgrade automatically.", "Il livello automatico usa le soglie di spesa cumulativa. I livelli manuali non aumentano automaticamente.", "Los niveles automáticos usan umbrales de gasto acumulado. Los niveles manuales no suben automáticamente."],
  "确认已收现金并充值": ["Confirm cash received and top up", "Conferma contanti ricevuti e ricarica", "Confirmar efectivo recibido y recargar"],
  "确认保存": ["Confirm and save", "Conferma e salva", "Confirmar y guardar"],
  "等级流水": ["Tier history", "Cronologia livelli", "Historial de niveles"],
  "抵扣积分": ["Points redeemed", "Punti riscattati", "Puntos canjeados"],
  "获得积分": ["Points earned", "Punti guadagnati", "Puntos obtenidos"],
  "本机余额": ["Local balance", "Saldo locale", "Saldo local"],
  "本机会员资产与流水保存在当前浏览器，请定期备份。": ["Local member balances and transactions are stored in this browser. Back up regularly.", "Saldi e movimenti locali sono salvati in questo browser. Esegui backup regolari.", "Los saldos y movimientos locales se guardan en este navegador. Realice copias periódicas."],
  "消费结算": ["Sale checkout", "Pagamento acquisto", "Pago de compra"],
  "余额消费": ["Balance payments", "Pagamenti con saldo", "Pagos con saldo"],
  "余额支付": ["Pay with balance", "Paga con saldo", "Pagar con saldo"],
  "等级优惠": ["Tier discount", "Sconto livello", "Descuento por nivel"],
  "余额不足，请先充值或选择现金": ["Insufficient balance. Top up or select cash.", "Saldo insufficiente. Ricarica o scegli contanti.", "Saldo insuficiente. Recargue o seleccione efectivo."],
  "订单和会员资产已保存在本机": ["Order and member balances saved locally", "Ordine e saldi salvati localmente", "Pedido y saldos guardados localmente"],
  "现金实收含充值，余额消费不重复计入": ["Cash received includes top-ups; balance payments are not counted again", "I contanti includono le ricariche; i pagamenti con saldo non vengono ricontati", "El efectivo incluye recargas; los pagos con saldo no se cuentan de nuevo"],
  "单机版 · 本机保存 · 支持现金、会员余额与积分": ["Standalone · Saved locally · Cash, member balances and points", "Versione locale · Salvataggio locale · Contanti, saldi e punti soci", "Versión local · Guardado local · Efectivo, saldos y puntos"],
  "商品分类、商品、会员、订单、会员规则与资产流水": ["Categories, products, members, orders, member rules and account transactions", "Categorie, prodotti, soci, ordini, regole e movimenti dei conti", "Categorías, productos, socios, pedidos, reglas y movimientos de cuentas"],
  "请填写有效名称或原因": ["Enter a valid name or reason", "Inserisci un nome o motivo valido", "Introduzca un nombre o motivo válido"],
  "会员数值超出允许范围": ["Member value is outside the allowed range", "Valore socio fuori intervallo", "Valor del socio fuera del rango permitido"],
  "积分必须为整数": ["Points must be a whole number", "I punti devono essere interi", "Los puntos deben ser enteros"],
  "请设置 1 至 20 个会员等级": ["Set between 1 and 20 member tiers", "Imposta da 1 a 20 livelli", "Configure entre 1 y 20 niveles"],
  "等级名称和门槛不能重复，首级门槛必须为 0": ["Tier names and thresholds must be unique; the first threshold must be 0", "Nomi e soglie devono essere unici; la prima soglia deve essere 0", "Los nombres y umbrales deben ser únicos; el primer umbral debe ser 0"],
  "不支持的会员操作": ["Unsupported member operation", "Operazione socio non supportata", "Operación de socio no admitida"],
  "相同请求的内容不一致": ["The same request has different content", "La stessa richiesta ha contenuto diverso", "La misma solicitud tiene contenido diferente"],
  "请输入有效充值金额": ["Enter a valid top-up amount", "Inserisci un importo di ricarica valido", "Introduzca un importe de recarga válido"],
  "积分调整须为非零整数": ["Points adjustment must be a non-zero integer", "La variazione punti deve essere un intero diverso da zero", "El ajuste de puntos debe ser un entero distinto de cero"],
  "会员等级不存在": ["Member tier not found", "Livello socio non trovato", "Nivel de socio no encontrado"],
  "单机版支持现金或余额支付": ["Standalone supports cash or balance payments", "La versione locale supporta contanti o saldo", "La versión local admite pagos en efectivo o con saldo"],
  "会员余额不足或支付数据不正确": ["Insufficient member balance or invalid payment data", "Saldo insufficiente o dati di pagamento non validi", "Saldo insuficiente o datos de pago incorrectos"],
  "会员流水格式错误": ["Invalid member transaction format", "Formato movimento socio non valido", "Formato de movimiento de socio incorrecto"],
  "会员流水引用不存在": ["Member transaction references a missing member", "Il movimento fa riferimento a un socio inesistente", "El movimiento hace referencia a un socio inexistente"],
  "会员流水与订单不一致": ["Member transaction does not match the order", "Il movimento non corrisponde all’ordine", "El movimiento no coincide con el pedido"],
  "订单缺少会员流水": ["Member transaction is missing for this order", "Movimento socio mancante per questo ordine", "Falta el movimiento del socio para este pedido"],
  "已有会员使用此等级，不能删除": ["This tier is referenced by member history and cannot be removed", "Questo livello è presente nella cronologia e non può essere rimosso", "Este nivel figura en el historial y no se puede eliminar"],
  "会员资产币种不同，不能合并": ["Member account currencies differ and cannot be merged", "Valute dei conti diverse: impossibile unire", "Las monedas de las cuentas difieren y no se pueden combinar"],
  "会员规则不同，请先核对规则再导入": ["Member rules differ. Check the rules before importing.", "Le regole soci differiscono. Verificale prima di importare.", "Las reglas de socios difieren. Revíselas antes de importar."],
  "已有会员资产流水，不能更改本机币种": ["Member account history exists. The local currency cannot be changed.", "Esistono movimenti dei conti soci. La valuta locale non può essere modificata.", "Hay movimientos de cuentas de socios. No se puede cambiar la moneda local."],
  "连接云端": ["Connect to cloud", "Connetti al cloud", "Conectar a la nube"],
  "云端地址": ["Cloud URL", "Indirizzo cloud", "Dirección de la nube"],
  "协议": ["Protocol", "Protocollo", "Protocolo"],
  "支持 HTTP 和 HTTPS 地址。": ["HTTP and HTTPS URLs are supported.", "Sono supportati indirizzi HTTP e HTTPS.", "Se admiten direcciones HTTP y HTTPS."],
  "保存云端地址后，在 POS 界面登录。": ["Save the cloud URL, then sign in from the POS screen.", "Salva l'indirizzo cloud, poi accedi dalla schermata POS.", "Guarde la dirección de la nube e inicie sesión desde la pantalla POS."],
  "单机版不支持此功能，请连接云端": ["Unavailable in standalone mode. Connect to the cloud.", "Non disponibile in modalità locale. Connettiti al cloud.", "No disponible en modo local. Conéctese a la nube."],
  "演示订单会计入本机看板，适合体验和试用。": ["Demo orders appear on the local dashboard and are intended for evaluation.", "Gli ordini demo appaiono nel cruscotto locale e servono per la prova.", "Los pedidos de demostración aparecen en el panel local y sirven para probar."],
  "以下是本机当前数据，清理前建议先导出备份。": ["Current local data. Export a backup before clearing.", "Dati locali attuali. Esporta una copia prima di cancellarli.", "Datos locales actuales. Exporte una copia antes de borrarlos."],
  "包含 12 个末级分类；重复记录自动跳过，完成后显示本次新增数量。": ["Includes 12 leaf categories. Existing records are skipped; counts show newly added records after completion.", "Include 12 categorie finali. I record esistenti vengono ignorati; al termine si mostrano i nuovi record.", "Incluye 12 categorías finales. Se omiten los registros existentes; al terminar se muestran los nuevos."],
  "加载进度": ["Loading progress", "Avanzamento caricamento", "Progreso de carga"],
  "等待加载演示数据": ["Ready to load demo data", "Pronto a caricare i dati demo", "Listo para cargar datos de demostración"],
  "正在写入本机数据…": ["Saving local data…", "Salvataggio dei dati locali…", "Guardando datos locales…"],
  "待加载": ["To load", "Da caricare", "Por cargar"],
  "本次新增": ["Added this time", "Aggiunti ora", "Añadidos ahora"],
  "确认退出": ["Sign out", "Conferma uscita", "Confirmar salida"],
  "是否确认退出？": ["Are you sure you want to sign out?", "Confermi di voler uscire?", "¿Confirma que desea cerrar sesión?"],
  "退出登录": ["Sign out", "Esci", "Cerrar sesión"],
  "选择币种": ["Select currency", "Seleziona valuta", "Seleccionar moneda"],
  "云端设置": ["Cloud settings", "Impostazioni cloud", "Configuración de la nube"],
  "开始使用单机版": ["Get started locally", "Inizia in modalità locale", "Empezar en modo local"],
  "本机还没有业务数据，选择一种方式开始。": ["There is no business data on this device. Choose how to get started.", "Non ci sono dati su questo dispositivo. Scegli come iniziare.", "Este dispositivo no tiene datos. Elija cómo empezar."],
  "体验示例商品、会员和现金订单": ["Explore sample products, members and cash orders", "Prova prodotti, soci e ordini in contanti di esempio", "Pruebe productos, socios y pedidos en efectivo de ejemplo"],
  "导入 Excel 商品或恢复 JSON 备份": ["Import products from Excel or restore a JSON backup", "Importa prodotti da Excel o ripristina una copia JSON", "Importe productos desde Excel o restaure una copia JSON"],
  "Excel 商品导入": ["Import products from Excel", "Importa prodotti da Excel", "Importar productos desde Excel"],
  "恢复 JSON 备份": ["Restore JSON backup", "Ripristina copia JSON", "Restaurar copia JSON"],
  "暂时跳过": ["Skip for now", "Salta per ora", "Omitir por ahora"],
  "币种设置": ["Currency settings", "Impostazioni valuta", "Ajustes de moneda"],
  "币种": ["Currency", "Valuta", "Moneda"],
  "搜索币种": ["Search currencies", "Cerca valute", "Buscar monedas"],
  "输入币种代码或名称": ["Currency code or name", "Codice o nome valuta", "Código o nombre de moneda"],
  "已选择": ["Selected", "Selezionata", "Seleccionada"],
  "设置本机收银币种。": ["Set the currency for local checkout.", "Imposta la valuta della cassa locale.", "Establezca la moneda de la caja local."],
  "当前公司下所有门店统一使用此币种。": ["All stores in this company share this currency.", "Tutti i negozi di questa azienda usano questa valuta.", "Todas las tiendas de esta empresa comparten esta moneda."],
  "修改币种不会自动换算商品价格；历史订单保留原币种。": ["Changing currency does not convert product prices. Existing orders keep their original currency.", "Cambiare valuta non converte i prezzi. Gli ordini esistenti conservano la valuta originale.", "Cambiar la moneda no convierte los precios. Los pedidos existentes conservan su moneda original."],
  "请选择有效币种": ["Select a valid currency", "Seleziona una valuta valida", "Seleccione una moneda válida"],
  "币种设置已保存": ["Currency settings saved", "Impostazioni valuta salvate", "Ajustes de moneda guardados"],
  "仅管理员可以修改公司币种": ["Only administrators can change the company currency", "Solo gli amministratori possono cambiare la valuta aziendale", "Solo los administradores pueden cambiar la moneda de la empresa"],
  "币种已变化，请重新核对订单": ["Currency changed. Review the order again.", "Valuta modificata. Verifica nuovamente l’ordine.", "La moneda cambió. Revise el pedido de nuevo."],
  "历史订单币种不能修改": ["Existing order currency cannot be changed", "La valuta degli ordini esistenti non può essere modificata", "No se puede cambiar la moneda de pedidos existentes"],
  "备份商品币种与当前币种不同，不能直接合并": ["Backup products use another currency and cannot be merged directly", "I prodotti della copia usano un’altra valuta e non possono essere uniti direttamente", "Los productos de la copia usan otra moneda y no se pueden combinar directamente"],
  "当前扫码支付通道仅支持人民币，请使用现金": ["The current scan-payment gateway only supports CNY. Use cash.", "Il gateway di pagamento con codice supporta solo CNY. Usa contanti.", "La pasarela de pagos escaneados solo admite CNY. Utilice efectivo."],
  "现有会员钱包和优惠券仅支持人民币": ["Existing member wallets and coupons use CNY only", "I portafogli dei soci e i coupon esistenti usano solo CNY", "Los monederos y cupones existentes solo usan CNY"],
  "金额须为有效金额，最多两位小数": ["Enter a valid amount with up to two decimals", "Inserisci un importo valido con massimo due decimali", "Introduzca un importe válido con hasta dos decimales"],
  "售价（{0}）*": ["Price ({0}) *", "Prezzo ({0}) *", "Precio ({0}) *"],
  "售价（{0}）": ["Price ({0})", "Prezzo ({0})", "Precio ({0})"],
  "成交单价（{0}）": ["Sale unit price ({0})", "Prezzo unitario ({0})", "Precio unitario ({0})"],
  "金额（{0}）": ["Amount ({0})", "Importo ({0})", "Importe ({0})"],
  "优惠券面额（{0}）": ["Coupon value ({0})", "Valore coupon ({0})", "Valor del cupón ({0})"],
  "请输入“{0}”以继续": ["Type “{0}” to continue", "Digita “{0}” per continuare", "Escriba «{0}» para continuar"],
  "加载演示数据": ["Load demo data", "Carica dati dimostrativi", "Cargar datos de demostración"],
  "清理所有数据": ["Clear all local data", "Elimina tutti i dati locali", "Borrar todos los datos locales"],
  "演示数据已加载": ["Demo data loaded", "Dati dimostrativi caricati", "Datos de demostración cargados"],
  "演示数据包含分类、商品、会员和示例现金订单，会计入本机看板；重复加载不会覆盖现有记录。": ["Demo data includes categories, products, a member and a sample cash order counted in the local dashboard. Reloading preserves existing records.", "I dati dimostrativi includono categorie, prodotti, un socio e un ordine in contanti conteggiato nel pannello locale. Ricaricare conserva i dati esistenti.", "Los datos incluyen categorías, productos, un socio y un pedido en efectivo que cuenta en el panel local. Recargar conserva los registros existentes."],
  "将删除本机全部业务数据、挂单和购物车，保留语言、币种及后台地址。此操作不能撤销。": ["All local business data, held orders and carts will be deleted. Language, currency and back office URL are kept. This cannot be undone.", "Saranno eliminati tutti i dati locali, gli ordini sospesi e i carrelli. Lingua, valuta e URL del back office restano salvati. Operazione irreversibile.", "Se borrarán los datos locales, pedidos aparcados y carritos. Se conservan idioma, moneda y URL del servidor. Esta acción no se puede deshacer."],
  "先导出备份": ["Export a backup first", "Esporta prima una copia", "Exportar una copia primero"],
  "请输入“确认清理”以继续": ["Type “确认清理” to continue", "Digita “确认清理” per continuare", "Escriba «确认清理» para continuar"],
  "确认清理": ["Confirm deletion", "Conferma eliminazione", "Confirmar eliminación"],
  "请输入确认清理": ["Enter the confirmation text", "Inserisci il testo di conferma", "Introduzca el texto de confirmación"],
  "业务数据翻译": ["Business data translations", "Traduzioni dei dati", "Traducciones de datos"],
  "译文为空时显示原文；条码、编号和会员姓名不翻译。": ["Empty translations use the original text. Barcodes, codes and member names are not translated.", "Le traduzioni vuote usano il testo originale. Codici e nomi dei soci non vengono tradotti.", "Las traducciones vacías usan el texto original. Los códigos y nombres de socios no se traducen."],
  "编辑翻译": ["Edit translations", "Modifica traduzioni", "Editar traducciones"],
  "翻译数据格式不正确": ["Invalid translation data", "Dati di traduzione non validi", "Datos de traducción no válidos"],
  "翻译字段或长度不正确": ["Invalid translation field or length", "Campo o lunghezza traduzione non validi", "Campo o longitud de traducción no válidos"],
  "不支持的翻译类型": ["Unsupported translation type", "Tipo di traduzione non supportato", "Tipo de traducción no compatible"],
  "记录不存在": ["Record not found", "Record non trovato", "Registro no encontrado"],
  "仅单机版可操作": ["Available in standalone mode only", "Disponibile solo in modalità locale", "Disponible solo en modo local"],
  "本机数据清理失败": ["Could not clear local data", "Impossibile eliminare i dati locali", "No se pudieron borrar los datos locales"],
  "维护翻译需要店长或管理员权限": ["A manager or administrator must edit translations", "Le traduzioni richiedono un responsabile o amministratore", "Se requiere un responsable o administrador para editar traducciones"],
  "记录不存在或不属于当前门店": ["Record not found or not available for this store", "Record non trovato o non disponibile per questo negozio", "Registro no encontrado o no disponible para esta tienda"],
  "翻译字段不正确": ["Invalid translation field", "Campo di traduzione non valido", "Campo de traducción no válido"],
  "翻译内容过长": ["Translation is too long", "Traduzione troppo lunga", "Traducción demasiado larga"],
  "请先在 Odoo 安装所选语言": ["Install the selected language in Odoo first", "Installa prima la lingua selezionata in Odoo", "Instale primero el idioma seleccionado en Odoo"],
  "属性值": ["Attribute value", "Valore attributo", "Valor del atributo"],
  "演示条码已被使用，未加载演示数据": ["Demo barcode already in use. No demo data loaded.", "Codice demo già utilizzato. Nessun dato caricato.", "Código de demostración en uso. No se han cargado datos."],
  "注册时间": ["Registered at", "Data registrazione", "Fecha de registro"],
  "资料更新时间": ["Profile updated", "Profilo aggiornato", "Perfil actualizado"],
  "等级评估开始": ["Tier review starts", "Inizio valutazione livello", "Inicio de revisión de nivel"],
  "等级评估结束": ["Tier review ends", "Fine valutazione livello", "Fin de revisión de nivel"],
  "增加": ["Increase", "Aumento", "Aumentar"],
  "待核销": ["Pending fulfillment", "Da evadere", "Pendiente de entrega"],
  "禁用 {0}": ["Disable {0}", "Disattiva {0}", "Desactivar {0}"],
  "删除第 {0} 行": ["Delete row {0}", "Elimina riga {0}", "Eliminar fila {0}"],
  "当前订单 · {0} 件": ["Current order · {0} items", "Ordine attuale · {0} articoli", "Pedido actual · {0} artículos"],
  "数量：{0} 件": ["Quantity: {0}", "Quantità: {0}", "Cantidad: {0}"],
  "数量 {0}": ["Quantity {0}", "Quantità {0}", "Cantidad {0}"],
  "共 {0} 件商品": ["{0} products", "{0} prodotti", "{0} productos"],
  "共 {0} 条": ["{0} records", "{0} record", "{0} registros"],
  "{0} 条/页": ["{0} rows/page", "{0} righe/pagina", "{0} filas/página"],
  "{0} 笔销售订单": ["{0} sales orders", "{0} ordini di vendita", "{0} pedidos de venta"],
  "RO POS · 门店收银": ["RO POS · Store Checkout", "RO POS · Cassa negozio", "RO POS · Caja de tienda"],

  "当前浏览器无法切换全屏，请使用浏览器的全屏菜单": ["Use your browser's full-screen menu.","Usa il menu schermo intero del browser.", "Utilice el menú de pantalla completa del navegador."],
  "本机订单仍保留：{0}": ["Local orders are retained: {0}","Ordini locali conservati: {0}", "Pedidos locales conservados: {0}"],
  "登录身份或门店权限已变化，请重新登录；离线现金记录仍保存在本机": ["Your account or store access changed. Sign in again. Offline cash records remain on this device.","Account o accesso al negozio modificato. Accedi di nuovo. I movimenti contanti offline restano sul dispositivo.", "Su cuenta o acceso a la tienda ha cambiado. Inicie sesión de nuevo. Los cobros sin conexión se conservan en este dispositivo."],
  "门店收银": ["Store checkout","Cassa negozio", "Caja de tienda"],
  "电商订单": ["Online orders","Ordini online", "Pedidos online"],
  "会员服务": ["Member services","Servizi soci", "Servicios para socios"],
  "离线模式：仅限本机缓存资料和门店现金收银": ["Offline: cached data and in-store cash payments only","Offline: solo dati memorizzati e pagamenti in contanti in negozio", "Sin conexión: solo datos guardados y cobros en efectivo en tienda"],
  "切换门店会清空当前购物车。如需保留商品，请取消并先挂单。": ["Switching stores clears the cart. Cancel and hold this order first to keep it.","Cambiare negozio svuota il carrello. Annulla e sospendi prima l'ordine per conservarlo.", "Cambiar de tienda vacía el carrito. Cancele y aparque primero el pedido para conservarlo."],
  "订单核销和业绩看板需要连接后台": ["Connect to the back office to view fulfillment and performance.","Collegati al back office per evasione ordini e prestazioni.", "Conéctese al servidor para consultar entregas y resultados."],
  "会员建档、充值和发券需要联网": ["Connect to create members, top up, or issue coupons.","Connettiti per creare soci, ricaricare o assegnare coupon.", "Conéctese para registrar socios, recargar saldo o emitir cupones."],
  "睿鸥门店收银系统": ["Ruiou POS","Ruiou POS", "Ruiou POS"],
  "登录页导航": ["Sign-in navigation","Navigazione accesso", "Navegación de acceso"],
  "RO POS 门店收银系统": ["RO POS Store Checkout","RO POS Cassa negozio", "RO POS Caja de tienda"],
  "睿鸥科技 版权所有": ["© Ruiou Technology. All rights reserved.","© Ruiou Technology. Tutti i diritti riservati.", "Ruiou Technology. Todos los derechos reservados."],
  "· 点击重新检测": ["· Click to check again","· Clicca per ricontrollare", "· Pulse para comprobar de nuevo"],
  "上传离线订单，待上传 {0} 笔": ["Upload offline orders ({0} pending)","Carica ordini offline ({0} in attesa)", "Subir pedidos sin conexión ({0} pendientes)"],
  "离线订单上传进度": ["Offline upload progress","Avanzamento caricamento offline", "Progreso de subida"],
  "已处理": ["Processed","Elaborati", "Procesados"],
  "笔": ["transactions","transazioni", "operaciones"],
  "成功": ["Succeeded","Riusciti", "Correctos"],
  "笔 · 失败": ["transactions · Failed","transazioni · Non riusciti", "operaciones · Fallidos"],
  "· 未处理": ["· Pending","· In attesa", "· Pendientes"],
  "已处理订单数": ["Orders processed","Ordini elaborati", "Pedidos procesados"],
  "待上传 {0} 笔订单，上传成功后自动移出队列。": ["{0} pending orders. Uploaded orders leave the queue automatically.","{0} ordini in attesa. Gli ordini caricati vengono rimossi automaticamente dalla coda.", "{0} pedidos pendientes. Los pedidos subidos se eliminan de la cola automáticamente."],
  "关闭窗口后，上传会继续进行。": ["Uploads continue after closing this window.","Il caricamento continua dopo la chiusura della finestra.", "La subida continúa después de cerrar esta ventana."],
  "选择当前员工有权限的门店。各门店待同步记录独立保留。": ["Select a store you can access. Each store keeps its own pending records.","Seleziona un negozio autorizzato. Ogni negozio conserva separatamente i record da sincronizzare.", "Seleccione una tienda autorizada. Cada tienda conserva sus propios registros pendientes."],
  "当前门店": ["Current store","Negozio attuale", "Tienda actual"],
  "离线收银 · 价格与库存为缓存数据 · 仅支持门店现金单 ·": ["Offline checkout · Cached prices and stock · In-store cash only ·","Cassa offline · Prezzi e scorte memorizzati · Solo contanti in negozio ·", "Caja sin conexión · Precios y existencias guardados · Solo efectivo ·"],
  "缓存更新于": ["Cache updated","Cache aggiornata", "Caché actualizada"],
  "当前门店未准备离线商品": ["Offline products are not ready for this store.","Prodotti offline non pronti per questo negozio.", "Los productos sin conexión aún no están disponibles para esta tienda."],
  "还没有可操作的门店": ["No stores available","Nessun negozio disponibile", "No hay tiendas disponibles"],
  "请管理员分配门店后重新连接。": ["Ask an administrator to assign a store, then reconnect.","Chiedi a un amministratore di assegnare un negozio, poi riconnettiti.", "Solicite a un administrador que le asigne una tienda y vuelva a conectarse."],
  "重新连接": ["Reconnect","Riconnetti", "Reconectar"],
  "当前离线，连接后台后可查看此页面。": ["You are offline. Connect to the back office to view this page.","Sei offline. Collegati al back office per visualizzare questa pagina.", "Sin conexión. Conéctese al servidor para ver esta página."],
  "单机版可备份、恢复本机分类、商品、会员与现金订单。在线版待上传订单请使用顶部上传入口。": ["Back up and restore local categories, products, members, and cash orders. For pending online-mode orders, use Upload in the top bar.","Salva e ripristina categorie, prodotti, soci e ordini in contanti locali. Per gli ordini online in attesa, usa Carica nella barra superiore.", "Guarde y restaure categorías, productos, socios y pedidos en efectivo locales. Para pedidos online pendientes, use Subir en la barra superior."],
  "员工操作": ["Staff actions","Azioni personale", "Acciones del empleado"],
  "切换用户": ["Switch user","Cambia utente", "Cambiar usuario"],
  "返回登录": ["Back to sign-in", "Torna all'accesso", "Volver al acceso"],
  "购物车还有商品，请先挂单，再返回登录。本机资料会保留。": ["Your cart contains items. Hold the order before returning to sign-in. Local data will be kept.", "Il carrello contiene articoli. Sospendi l'ordine prima di tornare all'accesso. I dati locali saranno conservati.", "El carrito contiene productos. Aparque el pedido antes de volver al acceso. Se conservarán los datos locales."],
  "返回收银去挂单": ["Return to checkout to hold", "Torna alla cassa per sospendere", "Volver a caja para aparcar"],
  "返回登录，保留当前员工的本机记录": ["Return to sign-in and keep this staff member's local records","Torna all'accesso e conserva i record locali del dipendente", "Volver al acceso conservando los registros locales de este empleado"],
  "锁定界面": ["Lock screen","Blocca schermo", "Bloquear pantalla"],
  "单机版无账号密码，请使用系统锁屏": ["Standalone mode has no password. Use your device's screen lock.","La modalità locale non ha password. Usa il blocco schermo del dispositivo.", "La versión local no tiene contraseña. Utilice el bloqueo de su dispositivo."],
  "保留当前工作，使用本人密码解锁": ["Keep your work and unlock with your password","Conserva il lavoro e sblocca con la tua password", "Conserve su trabajo y desbloquee con su contraseña"],
  "工作台已锁定": ["Workspace locked","Area di lavoro bloccata", "Área de trabajo bloqueada"],
  "· 当前订单已保留": ["· Current order retained","· Ordine attuale conservato", "· Pedido actual conservado"],
  "员工密码": ["Staff password","Password dipendente", "Contraseña del empleado"],
  "输入当前员工密码": ["Enter your password","Inserisci la tua password", "Introduzca su contraseña"],
  "联网验证密码后即可解锁。": ["Connect to verify your password and unlock.","Connettiti per verificare la password e sbloccare.", "Conéctese para verificar la contraseña y desbloquear."],
  "正在验证…": ["Verifying…","Verifica…", "Verificando…"],
  "解锁工作台": ["Unlock workspace","Sblocca area di lavoro", "Desbloquear área de trabajo"],
  "添加收货地址": ["Add delivery address","Aggiungi indirizzo di consegna", "Añadir dirección de entrega"],
  "收货人 *": ["Recipient *","Destinatario *", "Destinatario *"],
  "手机号 *": ["Phone *","Telefono *", "Teléfono *"],
  "省份 *": ["Province *","Provincia *", "Provincia *"],
  "选择省份": ["Select province","Seleziona provincia", "Seleccione provincia"],
  "城市 *": ["City *","Città *", "Ciudad *"],
  "选择城市": ["Select city","Seleziona città", "Seleccione ciudad"],
  "区县 *": ["District *","Distretto *", "Distrito *"],
  "选择区县": ["Select district","Seleziona distretto", "Seleccione distrito"],
  "详细地址 *": ["Street address *","Indirizzo completo *", "Dirección *"],
  "保存地址": ["Save address","Salva indirizzo", "Guardar dirección"],
  "后台地址不正确": ["Invalid back office URL","URL del back office non valido", "URL del servidor no válida"],
  "连接后将进入后台部署的完整睿鸥收银系统。": ["Connect to open the full Ruiou POS system hosted by your back office.","Collegati per aprire il sistema Ruiou POS completo ospitato dal tuo back office.", "Conéctese para abrir el sistema Ruiou POS completo alojado en su servidor."],
  "睿鸥后台地址": ["Ruiou Back Office URL","URL Ruiou Back Office", "URL de Ruiou Back Office"],
  "请填写完整站点地址。连接后页面会整体跳转，登录、接口、图片和支付都由该后台提供。": ["Enter the full site URL. You will be redirected to that site, which provides sign-in, services, images, and payments.","Inserisci l'URL completo. Verrai reindirizzato al sito, che fornisce accesso, servizi, immagini e pagamenti.", "Introduzca la URL completa. Se abrirá ese sitio, que proporciona acceso, servicios, imágenes y pagos."],
  "清除已保存地址": ["Clear saved URL","Cancella URL salvato", "Borrar URL guardada"],
  "保存并进入睿鸥后台": ["Save and connect","Salva e connetti", "Guardar y conectar"],
  "优惠券规则": ["Coupon rules","Regole coupon", "Reglas de cupones"],
  "面额 / 门槛": ["Value / Minimum spend","Valore / Spesa minima", "Valor / Compra mínima"],
  "草稿": ["Draft","Bozza", "Borrador"],
  "已生效": ["Active","Attivo", "Activo"],
  "已失效": ["Expired","Scaduto", "Caducado"],
  "规则已生效，优惠券可在发放页面领取": ["Rule activated. Coupons are available on the issue page.","Regola attivata. I coupon sono disponibili nella pagina di assegnazione.", "Regla activada. Los cupones están disponibles para su emisión."],
  "返回列表": ["Back to list","Torna all'elenco", "Volver a la lista"],
  "上次保存结果待确认，请核实原请求后再修改。": ["Verify the previous save before making more changes.","Verifica il salvataggio precedente prima di apportare modifiche.", "Verifique el guardado anterior antes de realizar más cambios."],
  "核实 / 重试原保存": ["Verify / Retry save","Verifica / Riprova salvataggio", "Verificar / Reintentar guardado"],
  "优惠券搜索": ["Search coupons","Cerca coupon", "Buscar cupones"],
  "优惠券名称": ["Coupon name","Nome coupon", "Nombre del cupón"],
  "新建规则": ["New rule","Nuova regola", "Nueva regla"],
  "创建普通固定面额规则，保存后确认启用。已生效规则只读；高级规则沿用后台配置。": ["Create a fixed-value rule, save, then activate it. Active rules are read-only; advanced rules are configured in the back office.","Crea una regola a valore fisso, salva e attivala. Le regole attive sono in sola lettura; quelle avanzate si configurano nel back office.", "Cree una regla de valor fijo, guárdela y actívela. Las reglas activas son de solo lectura; las avanzadas se configuran en el servidor."],
  "资料与电商同步。": ["Data is synced with the online store.","Dati sincronizzati con il negozio online.", "Los datos se sincronizan con la tienda online."],
  "发行 {0} 张 · 每人 {1} 张": ["{0} issued · {1} per member","{0} emessi · {1} per socio", "{0} emitidos · {1} por socio"],
  "随机面额": ["Variable value","Valore variabile", "Valor variable"],
  "充值": ["Top up","Ricarica", "Recargar"],
  "查看详情": ["View details","Vedi dettagli", "Ver detalles"],
  "查看": ["View","Visualizza", "Ver"],
  "编辑详情": ["Edit details","Modifica dettagli", "Editar datos"],
  "卡号": ["Card number","Numero tessera", "Número de tarjeta"],
  "· 余额": ["· Balance","· Saldo", "· Saldo"],
  "。名称、分类及描述由同一商品的所有规格共用；售价仅修改当前规格。": [". Name, category, and description apply to all variants; price changes apply only to this variant.",". Nome, categoria e descrizione sono condivisi da tutte le varianti; il prezzo riguarda solo questa variante.", ". El nombre, la categoría y la descripción se aplican a todas las variantes; el precio solo a esta variante."],
  "规则名称": ["Rule name","Nome regola", "Nombre de regla"],
  "优惠券面额（元）": ["Coupon value (CNY)","Valore coupon (CNY)", "Valor del cupón (CNY)"],
  "随机面额规则，具体范围请在后台查看。": ["Variable-value rule. View the value range in the back office.","Regola a valore variabile. Consulta l'intervallo nel back office.", "Regla de valor variable. Consulte el intervalo en el servidor."],
  "使用门槛（0 为无门槛）": ["Minimum spend (0 for none)","Spesa minima (0 per nessuna)", "Compra mínima (0 sin mínimo)"],
  "发行数量": ["Quantity issued","Quantità emessa", "Cantidad emitida"],
  "每人限领": ["Limit per member","Limite per socio", "Límite por socio"],
  "有效期类型": ["Validity type","Tipo di validità", "Tipo de validez"],
  "领取后有效": ["Valid after issue","Valido dopo l'assegnazione", "Válido tras emisión"],
  "固定起止时间": ["Fixed dates","Date fisse", "Fechas fijas"],
  "领取后几天生效": ["Days until activation","Giorni prima dell'attivazione", "Días hasta activación"],
  "领取后几天到期": ["Days until expiry","Giorni prima della scadenza", "Días hasta caducidad"],
  "生效时间": ["Valid from","Valido dal", "Válido desde"],
  "到期时间": ["Expires at","Scade il", "Caduca el"],
  "面额沿用现有整元券。时间按本机时区填写。新规则适用于全部商品、全部会员，仅通过发券入口发放。": ["Values use whole CNY. Enter dates in your local time zone. New rules apply to all products and members, and coupons are issued manually.","Valori in CNY interi. Inserisci le date nel fuso locale. Le nuove regole valgono per tutti i prodotti e soci; i coupon vengono assegnati manualmente.", "Importes en CNY enteros. Introduzca fechas en su zona horaria. Las reglas nuevas se aplican a todos los productos y socios; los cupones se emiten manualmente."],
  "此规则只读，避免影响现有优惠券。需调整时请新建规则。": ["This rule is read-only to protect existing coupons. Create a new rule to make changes.","Regola in sola lettura per proteggere i coupon esistenti. Crea una nuova regola per modificarla.", "Esta regla es de solo lectura para proteger los cupones existentes. Cree otra regla para modificarla."],
  "确认启用已保存的规则后生成优惠券；当前表单未保存的修改不会生效。": ["Activation generates coupons from the saved rule. Unsaved changes will not apply.","L'attivazione genera coupon dalla regola salvata. Le modifiche non salvate non verranno applicate.", "La activación genera cupones con la regla guardada. No se aplicarán los cambios sin guardar."],
  "确认启用已保存规则": ["Activate saved rule","Attiva regola salvata", "Activar regla guardada"],
  "单选商品分类穿梭框": ["Single category selector","Selettore di categoria singola", "Selector de categoría única"],
  "逐级展开，选择最末级分类": ["Expand each level and select a leaf category","Espandi i livelli e seleziona una categoria finale", "Despliegue cada nivel y seleccione una categoría final"],
  "选入分类": ["Add category","Aggiungi categoria", "Añadir categoría"],
  "移除分类": ["Remove category","Rimuovi categoria", "Quitar categoría"],
  "已选分类 ·": ["Selected category ·","Categoria selezionata ·", "Categoría seleccionada ·"],
  "选择后点击箭头移入": ["Select a category, then click the arrow","Seleziona una categoria, poi clicca sulla freccia", "Seleccione una categoría y pulse la flecha"],
  "简体中文": ["简体中文","简体中文", "简体中文"],
  "已导出 {0} 条记录": ["Exported {0} records","Esportati {0} record", "{0} registros exportados"],
  "导出失败：{0}": ["Export failed: {0}","Esportazione non riuscita: {0}", "Error al exportar: {0}"],
  "已选": ["Selected","Selezionati", "Seleccionados"],
  "条": ["records","record", "registros"],
  "清空选择": ["Clear selection","Cancella selezione", "Borrar selección"],
  "Excel 导出需连接在线门店": ["Connect to an online store to export Excel","Collegati a un negozio online per esportare Excel", "Conéctese a una tienda online para exportar Excel"],
  "仅导出勾选的记录，沿用当前排序": ["Export selected records in the current order","Esporta i record selezionati nell'ordine attuale", "Exportar registros seleccionados en el orden actual"],
  "正在导出…": ["Exporting…","Esportazione…", "Exportando…"],
  "共": ["Total","Totale", "Total"],
  "条/页": ["rows/page","righe/pagina", "filas/página"],
  "第 {0} 页": ["Page {0}","Pagina {0}", "Página {0}"],
  "选择第 {0} 行": ["Select row {0}","Seleziona riga {0}", "Seleccionar fila {0}"],
  "正在加载…": ["Loading…","Caricamento…", "Cargando…"],
  "重新加载": ["Reload","Ricarica", "Recargar"],
  "无法读取会员操作记录": ["Could not load member activity","Impossibile caricare l'attività del socio", "No se pudo cargar la actividad del socio"],
  "会员已创建": ["Member created","Socio creato", "Socio creado"],
  "会员已创建并选中": ["Member created and selected","Socio creato e selezionato", "Socio creado y seleccionado"],
  "已发放 {0} 张优惠券": ["Issued {0} coupons","Assegnati {0} coupon", "{0} cupones emitidos"],
  "已发放 {0} {1}": ["Issued {0} {1}","Assegnati {0} {1}", "Emitidos {0} {1}"],
  "新建会员、充值和发券需联网。": ["Connect to create members, top up, or issue coupons.","Connettiti per creare soci, ricaricare o assegnare coupon.", "Conéctese para registrar socios, recargar saldo o emitir cupones."],
  "已有充值单，请继续处理": ["Continue the existing top-up order","Continua l'ordine di ricarica esistente", "Continuar el pedido de recarga existente"],
  "上次操作结果待确认，请核实原请求": ["Verify the result of the previous request","Verifica il risultato della richiesta precedente", "Verificar el resultado de la solicitud anterior"],
  "继续充值单": ["Continue top-up","Continua ricarica", "Continuar recarga"],
  "核实 / 重试原操作": ["Verify / Retry operation","Verifica / Riprova operazione", "Verificar / Reintentar operación"],
  "可用券": ["Available coupons","Coupon disponibili", "Cupones disponibles"],
  "张": ["coupons","coupon", "cupones"],
  "店长或电商管理员可发券。": ["Store managers and online administrators can issue coupons.","I responsabili negozio e gli amministratori online possono assegnare coupon.", "Los responsables de tienda y administradores online pueden emitir cupones."],
  "联系电话（选填）": ["Phone (optional)","Telefono (facoltativo)", "Teléfono (opcional)"],
  "自动生成会员卡号，创建后自动选中，购物车保留。": ["A card number is generated and the member selected automatically. Your cart is kept.","Il numero tessera viene generato e il socio selezionato automaticamente. Il carrello viene conservato.", "Se genera un número de tarjeta y se selecciona el socio automáticamente. Se conserva su carrito."],
  "创建并选择会员": ["Create and select member","Crea e seleziona socio", "Crear y seleccionar socio"],
  "赠送金额不收款，充值款全额到账后一起存入钱包。": ["The bonus is free and credited with the top-up after full payment.","Il bonus è gratuito e viene accreditato insieme alla ricarica dopo il pagamento completo.", "La bonificación es gratuita y se abona con la recarga tras el pago completo."],
  "店长或管理员可设置赠送金额。": ["Managers and administrators can set a bonus amount.","Responsabili e amministratori possono impostare un bonus.", "Los responsables y administradores pueden establecer una bonificación."],
  "合计到账": ["Total credit","Credito totale", "Abono total"],
  "确认充值并收款": ["Confirm top-up and pay","Conferma ricarica e paga", "Confirmar recarga y pagar"],
  "处理中…": ["Processing…","Elaborazione…", "Procesando…"],
  "暂无可发放优惠券": ["No coupons available to issue","Nessun coupon disponibile da assegnare", "No hay cupones disponibles para emitir"],
  "满 {0} 可用": ["Minimum spend {0}","Spesa minima {0}", "Compra mínima {0}"],
  "优惠券分页": ["Coupon pagination","Paginazione coupon", "Paginación de cupones"],
  "确认发放": ["Confirm issue","Conferma assegnazione", "Confirmar emisión"],
  "说明": ["Description","Descrizione", "Descripción"],
  "账户": ["Account","Conto", "Cuenta"],
  "申请时间": ["Requested at","Data richiesta", "Fecha de solicitud"],
  "申请原因": ["Request reason","Motivo richiesta", "Motivo de solicitud"],
  "审核状态": ["Review status","Stato verifica", "Estado de revisión"],
  "处理意见": ["Review notes","Note di verifica", "Notas de revisión"],
  "券码": ["Coupon code","Codice coupon", "Código de cupón"],
  "面额": ["Value","Valore", "Valor"],
  "使用门槛": ["Minimum spend","Spesa minima", "Compra mínima"],
  "订单号 / 支付流水号": ["Order / Payment reference","Ordine / Riferimento pagamento", "Referencia de pedido / pago"],
  "搜索记录": ["Search records","Cerca record", "Buscar registros"],
  "会员资料已保存": ["Member profile saved","Profilo socio salvato", "Perfil del socio guardado"],
  "返回会员列表": ["Back to members","Torna ai soci", "Volver a socios"],
  "正在加载会员资料…": ["Loading member profile…","Caricamento profilo socio…", "Cargando perfil del socio…"],
  "上次资料保存结果待确认，请核实原请求。": ["Verify the previous profile save.","Verifica il salvataggio precedente del profilo.", "Verifique el guardado anterior del perfil."],
  "会员详情分类": ["Member detail tabs","Schede dettagli socio", "Pestañas del socio"],
  "会员基本资料": ["Member profile","Anagrafica socio", "Perfil del socio"],
  "此处展示退换货申请与审核结果；审核通过不代表现金退款已经完成。": ["Returns and review results are shown here. Approval does not mean the cash refund has been completed.","Qui sono mostrati resi ed esiti delle verifiche. L'approvazione non indica che il rimborso in contanti sia stato completato.", "Aquí se muestran devoluciones y resultados de revisión. La aprobación no significa que se haya realizado el reembolso en efectivo."],
  "编辑会员资料": ["Edit member profile","Modifica profilo socio", "Editar perfil del socio"],
  "会员姓名 *": ["Member name *","Nome socio *", "Nombre del socio *"],
  "邮箱": ["Email","Email", "Correo electrónico"],
  "会员等级": ["Member tier","Livello socio", "Nivel del socio"],
  "卡号及等级在此只读；积分、余额由业务流水计算。": ["Card number and tier are read-only. Points and balance are calculated from transactions.","Numero tessera e livello sono in sola lettura. Punti e saldo sono calcolati dai movimenti.", "La tarjeta y el nivel son de solo lectura. Los puntos y el saldo se calculan a partir de las operaciones."],
  "核实原保存": ["Verify previous save","Verifica salvataggio precedente", "Verificar guardado anterior"],
  "RO-POS-单机备份-{0}.json": ["RO-POS-local-backup-{0}.json","RO-POS-backup-locale-{0}.json", "RO-POS-copia-local-{0}.json"],
  "已导出本机分类、商品、会员与历史现金订单": ["Exported local categories, products, members, and cash orders","Esportati categorie, prodotti, soci e ordini in contanti locali", "Categorías, productos, socios y pedidos en efectivo locales exportados"],
  "备份文件不能超过 100MB": ["Backup file must be under 100 MB","Il backup non deve superare 100 MB", "La copia debe ser inferior a 100 MB"],
  "离线资料已合并保存；未覆盖原有数据，也未发起收款": ["Local data merged. Existing data was kept; no payment was initiated.","Dati locali uniti. Dati esistenti conservati; nessun pagamento avviato.", "Datos locales combinados. Se conservaron los existentes; no se realizó ningún cobro."],
  "备份本机单机账本，包含商品分类、商品图片、会员资料、历史订单和现金收款。导入时保留原记录，相同记录自动跳过。": ["Back up categories, product images, members, orders, and cash payments. Imports keep existing records and skip duplicates.","Salva categorie, immagini prodotti, soci, ordini e pagamenti in contanti. L'importazione conserva i record esistenti e salta i duplicati.", "Guarde categorías, imágenes, socios, pedidos y pagos en efectivo. Al importar se conservan los registros existentes y se omiten duplicados."],
  "现金订单": ["Cash orders","Ordini in contanti", "Pedidos en efectivo"],
  "选择备份文件": ["Choose backup file","Scegli file di backup", "Elegir copia de seguridad"],
  "导入预览": ["Import preview","Anteprima importazione", "Vista previa de importación"],
  "新增分类": ["New categories","Nuove categorie", "Categorías nuevas"],
  "个 · 商品": ["· Products","· Prodotti", "· Productos"],
  "件 · 会员": ["· Members","· Soci", "· Socios"],
  "位 · 现金订单": ["· Cash orders","· Ordini in contanti", "· Pedidos en efectivo"],
  "跳过相同记录": ["Skip duplicate records","Salta record duplicati", "Omitir registros duplicados"],
  "条。确认后只写入本机，不会再次收款。": ["records. Confirmation saves locally without charging again.","record. La conferma salva localmente senza un nuovo addebito.", "registros. Al confirmar se guardan localmente sin volver a cobrar."],
  "正在保存…": ["Saving…","Salvataggio…", "Guardando…"],
  "确认合并导入": ["Merge and import","Unisci e importa", "Combinar e importar"],
  "数据保存在当前浏览器，请定期导出，清理浏览器数据会删除本机账本。": ["Data is saved in this browser. Export regularly: clearing browser data deletes the local ledger.","I dati sono salvati nel browser. Esportali regolarmente: cancellare i dati del browser elimina il registro locale.", "Los datos se guardan en este navegador. Exporte con regularidad: borrar los datos del navegador elimina el libro local."],
  "当前为在线版。此处导入的单机账本独立保存，不会直接覆盖云端商品、会员或订单。": ["Online mode: imported local ledgers are stored separately and do not overwrite cloud products, members, or orders.","Modalità online: i registri importati sono salvati separatamente e non sovrascrivono prodotti, soci o ordini nel cloud.", "Modo online: los libros importados se guardan por separado y no sustituyen productos, socios ni pedidos de la nube."],
  "升级在线版时，请保留此备份用于迁移。备份包含原始唯一标识、商品关联、交易时间、实收与找零，便于核对，避免重复入账。": ["Keep this backup when upgrading online. It contains original IDs, product links, transaction times, receipts, and change for reconciliation without duplicate entries.","Conserva il backup per il passaggio online. Contiene ID originali, collegamenti ai prodotti, orari, incassi e resto per la riconciliazione senza duplicati.", "Conserve esta copia al pasar al modo online. Incluye identificadores originales, enlaces a productos, fechas, cobros y cambio para conciliar sin duplicados."],
  "收款时间 / 流水": ["Payment time / Reference","Data pagamento / Riferimento", "Fecha de pago / Referencia"],
  "云端订单 {0}，金额 {1}，已收 {2}；可重试同步核对并确认本机记录。": ["Cloud order {0}: total {1}, paid {2}. Retry sync to reconcile the local record.","Ordine cloud {0}: totale {1}, pagato {2}. Riprova la sincronizzazione per riconciliare il record locale.", "Pedido en la nube {0}: total {1}, pagado {2}. Reintente la sincronización para conciliar el registro local."],
  "云端未找到该流水；可重试同步。": ["Reference not found in the cloud. Retry sync.","Riferimento non trovato nel cloud. Riprova la sincronizzazione.", "Referencia no encontrada en la nube. Reintente la sincronización."],
  "POS待同步记录-{0}-{1}.json": ["POS-pending-sync-{0}-{1}.json","POS-da-sincronizzare-{0}-{1}.json", "POS-sincronizacion-pendiente-{0}-{1}.json"],
  "待同步订单": ["Orders pending sync","Ordini da sincronizzare", "Pedidos pendientes de sincronización"],
  "保留原收款流水核实与重试；同步成功后才移出列表。导出文件用于留存，不是单机账本导入文件。": ["Original payment references are kept for verification and retries until synced. Exports are for your records, not local-ledger imports.","I riferimenti originali sono conservati per verifiche e tentativi fino alla sincronizzazione. Le esportazioni servono per l'archivio, non per importare registri locali.", "Las referencias originales se conservan para verificaciones y reintentos hasta sincronizar. La exportación es informativa, no para importar libros locales."],
  "流水搜索": ["Search transactions","Cerca transazioni", "Buscar operaciones"],
  "时间、流水号、金额、失败原因": ["Time, reference, amount, or error","Data, riferimento, importo o errore", "Fecha, referencia, importe o error"],
  "导出待同步记录": ["Export pending records","Esporta record in attesa", "Exportar registros pendientes"],
  "待同步": ["Pending sync","Da sincronizzare", "Pendiente de sincronización"],
  "核实原单": ["Verify original order","Verifica ordine originale", "Verificar pedido original"],
  "重试同步": ["Retry sync","Riprova sincronizzazione", "Reintentar sincronización"],
  "会员钱包": ["Member wallet","Portafoglio socio", "Monedero del socio"],
  "待扫码提交": ["Awaiting scan","In attesa di scansione", "Esperando escaneo"],
  "结果待确认": ["Result unconfirmed","Esito da confermare", "Resultado sin confirmar"],
  "撤销中": ["Cancelling","Annullamento", "Cancelando"],
  "失败": ["Failed","Non riuscito", "Fallido"],
  "已撤销": ["Voided","Annullato", "Anulado"],
  "无法读取本机现金记录，请先核对云端订单": ["Cannot read local cash records. Verify the cloud order first.","Impossibile leggere i movimenti contanti locali. Verifica prima l'ordine cloud.", "No se pueden leer los cobros locales. Verifique primero el pedido en la nube."],
  "请核对本次净收与现金实收金额": ["Check the net amount and cash received","Verifica l'importo netto e i contanti ricevuti", "Compruebe el importe neto y el efectivo recibido"],
  "云端尚未确认现金入账，本机记录继续保留": ["Cash payment is not confirmed in the cloud. Local records are retained.","Pagamento in contanti non confermato nel cloud. I record locali sono conservati.", "El cobro no está confirmado en la nube. Se conservan los registros locales."],
  "订单已付清": ["Order fully paid","Ordine saldato", "Pedido pagado por completo"],
  "本笔现金已登记，可继续收取剩余金额": ["Cash recorded. You can collect the remaining amount.","Contanti registrati. Puoi incassare l'importo restante.", "Efectivo registrado. Puede cobrar el importe restante."],
  "提货核销成功": ["Pickup confirmed","Ritiro confermato", "Recogida confirmada"],
  "已查询原交易并处理撤销，请查看交易状态": ["Original transaction checked and cancellation processed. Check its status.","Transazione originale verificata e annullamento elaborato. Controlla lo stato.", "Operación original verificada y cancelación procesada. Compruebe su estado."],
  "订单已取消": ["Order cancelled","Ordine annullato", "Pedido cancelado"],
  "；本笔未入账，可修改后重试。": ["; this payment was not recorded. Edit and retry.","; pagamento non registrato. Modifica e riprova.", "; este pago no se ha registrado. Edite y vuelva a intentarlo."],
  "；先刷新确认结果，或重试同一笔现金登记。": ["; refresh to verify, or retry the same cash entry.","; aggiorna per verificare, oppure riprova lo stesso movimento contanti.", "; actualice para verificar o reintente el mismo cobro."],
  "原交易结果待确认，请先刷新订单核实": ["Original transaction unconfirmed. Refresh the order to verify.","Transazione originale da confermare. Aggiorna l'ordine per verificare.", "Operación original sin confirmar. Actualice el pedido para verificarla."],
  "付款码与所选支付方式不一致，请切换支付方式或重新扫码": ["Code does not match the payment method. Switch methods or scan again.","Il codice non corrisponde al metodo di pagamento. Cambia metodo o scansiona di nuovo.", "El código no corresponde al método de pago. Cambie de método o escanee de nuevo."],
  "请扫描顾客的微信或支付宝付款码": ["Scan the customer's WeChat Pay or Alipay code","Scansiona il codice WeChat Pay o Alipay del cliente", "Escanee el código de WeChat Pay o Alipay del cliente"],
  "本笔扫码金额须大于零，且不能超过剩余应收": ["Payment must be above zero and no more than the balance due","Il pagamento deve essere positivo e non superare il saldo dovuto", "El pago debe ser mayor que cero y no superar el importe pendiente"],
  "已有支付待确认，请先查询原交易": ["A payment is unconfirmed. Check the original transaction first.","Un pagamento è da confermare. Controlla prima la transazione originale.", "Hay un pago sin confirmar. Compruebe primero la operación original."],
  "付款码与当前待提交交易渠道不一致，请先撤销该笔": ["Code does not match this pending transaction. Cancel it first.","Il codice non corrisponde alla transazione in attesa. Annullala prima.", "El código no corresponde a la operación pendiente. Cancélela primero."],
  "；请刷新订单确认原交易状态。": ["; refresh the order to verify the original transaction.","; aggiorna l'ordine per verificare la transazione originale.", "; actualice el pedido para verificar la operación original."],
  "改价记录": ["Price changes","Modifiche prezzo", "Cambios de precio"],
  "· 授权人": ["· Authorized by","· Autorizzato da", "· Autorizado por"],
  "· 充值": ["· Top-up","· Ricarica", "· Recarga"],
  "· 赠送": ["· Bonus","· Bonus", "· Bonificación"],
  "· 合计到账": ["· Total credit","· Credito totale", "· Abono total"],
  "支付": ["Payment","Pagamento", "Pago"],
  "，请先核实结果。": [". Verify the result first.",". Verifica prima il risultato.", ". Verifique primero el resultado."],
  "刷新状态": ["Refresh status","Aggiorna stato", "Actualizar estado"],
  "核实并撤销扫码": ["Verify and void scan payment","Verifica e annulla pagamento tramite codice", "Verificar y anular pago escaneado"],
  "顾客付款码": ["Customer payment code","Codice pagamento cliente", "Código de pago del cliente"],
  "扫描顾客付款码": ["Scan customer payment code","Scansiona codice pagamento cliente", "Escanear código de pago del cliente"],
  "确认查询并撤销未完成的扫码交易？已确认成功的付款会保留。": ["Check and cancel unfinished scan payments? Confirmed payments are kept.","Verificare e annullare i pagamenti tramite codice incompleti? I pagamenti confermati vengono conservati.", "¿Verificar y cancelar los pagos escaneados sin finalizar? Los confirmados se conservan."],
  "确认撤销": ["Confirm cancellation","Conferma annullamento", "Confirmar cancelación"],
  "正在确认…": ["Confirming…","Conferma…", "Confirmando…"],
  "重试原收款": ["Retry original payment","Riprova pagamento originale", "Reintentar pago original"],
  "返回选购": ["Back to shopping","Torna agli acquisti", "Volver a comprar"],
  "收款成功后可打印小票。下方记录每笔已收金额。": ["Print a receipt after payment. Individual payments are listed below.","Stampa la ricevuta dopo il pagamento. I singoli incassi sono elencati sotto.", "Imprima el recibo tras el pago. Los pagos individuales aparecen a continuación."],
  "会员充值收款": ["Member top-up payment","Pagamento ricarica socio", "Pago de recarga del socio"],
  "订单收款": ["Order payment","Pagamento ordine", "Pago del pedido"],
  "已收齐": ["Fully paid","Saldato", "Pagado por completo"],
  "部分收款": ["Partially paid","Pagato parzialmente", "Pagado parcialmente"],
  "订单应付": ["Order total due","Totale ordine dovuto", "Total pendiente del pedido"],
  "已收": ["Received","Ricevuto", "Recibido"],
  "已充值 {0}，充值后余额 {1}": ["Topped up {0}. New balance: {1}","Ricaricati {0}. Nuovo saldo: {1}", "Recarga de {0}. Nuevo saldo: {1}"],
  "全额收款确认后才增加会员钱包余额。": ["Wallet balance increases after full payment is confirmed.","Il saldo aumenta dopo la conferma del pagamento completo.", "El saldo aumenta tras confirmar el pago completo."],
  "当前扫码交易": ["Current scan payment","Pagamento tramite codice attuale", "Pago escaneado actual"],
  "。确认结果或撤销成功前，不能重复收款或改收现金。": [". Do not retry payment or switch to cash until confirmed or cancelled.",". Non ripetere il pagamento né passare ai contanti prima della conferma o dell'annullamento.", ". No reintente el pago ni cambie a efectivo hasta confirmarlo o cancelarlo."],
  "此订单已通过小程序发起支付，请核实原支付结果；不能切换柜台收款。": ["Payment was started in the mini program. Verify it there; counter payment is unavailable.","Pagamento avviato nella mini app. Verifica il risultato; il pagamento alla cassa non è disponibile.", "El pago se inició en la miniaplicación. Verifíquelo allí; no está disponible el cobro en caja."],
  "核对并提货": ["Verify and collect","Verifica e ritira", "Verificar y cobrar"],
  "取消订单": ["Cancel order","Annulla ordine", "Cancelar pedido"],
  "混合支付时，修改本次抵扣金额，收取余款时再切换支付方式。": ["For split payments, enter this payment's amount, then switch methods for the remainder.","Per pagamenti frazionati, inserisci questo importo, poi cambia metodo per il resto.", "Para pagos divididos, introduzca este importe y cambie de método para el restante."],
  "本次抵扣订单金额": ["Amount applied to order","Importo applicato all'ordine", "Importe aplicado al pedido"],
  "应找零": ["Change due","Resto dovuto", "Cambio a devolver"],
  "本笔后剩余": ["Remaining after payment","Residuo dopo il pagamento", "Pendiente tras el pago"],
  "重试同一笔现金登记": ["Retry same cash entry","Riprova stesso movimento contanti", "Reintentar mismo cobro en efectivo"],
  "扫描顾客付款码，确认本次收款金额。": ["Scan the customer's code and confirm the payment amount.","Scansiona il codice cliente e conferma l'importo.", "Escanee el código del cliente y confirme el importe."],
  "本次扫码金额": ["Scan payment amount","Importo pagamento tramite codice", "Importe del pago escaneado"],
  "请扫描微信 / 支付宝付款码": ["Scan WeChat Pay / Alipay code","Scansiona codice WeChat Pay / Alipay", "Escanear código de WeChat Pay / Alipay"],
  "确认商品已交付给顾客？": ["Confirm products were handed to the customer?","Confermare la consegna dei prodotti al cliente?", "¿Confirma la entrega de los productos al cliente?"],
  "先查询支付结果，再撤销未确认的扫码交易？": ["Check payment results, then cancel unconfirmed scan payments?","Verificare gli esiti e annullare i pagamenti tramite codice non confermati?", "¿Verificar los resultados y cancelar los pagos escaneados sin confirmar?"],
  "确认取消未付款订单？": ["Cancel the unpaid order?","Annullare l'ordine non pagato?", "¿Cancelar el pedido sin pagar?"],
  "已确认成功的交易保留；撤销可能退回刚扣取的扫码款。已收现金保留。": ["Confirmed payments are kept. Cancellation may refund recently charged scan payments. Cash already collected is kept.","I pagamenti confermati restano. L'annullamento può rimborsare addebiti recenti tramite codice. I contanti già incassati restano.", "Los pagos confirmados se conservan. La cancelación puede reembolsar pagos escaneados recientes. El efectivo ya cobrado se conserva."],
  "请至少选择一家门店": ["Select at least one store","Seleziona almeno un negozio", "Seleccione al menos una tienda"],
  "结束日期不能早于开始日期": ["End date cannot precede start date","La data finale non può precedere quella iniziale", "La fecha final no puede ser anterior a la inicial"],
  "提货码 / 订单号": ["Pickup code / Order number","Codice ritiro / Numero ordine", "Código de recogida / Número de pedido"],
  "核对订单": ["Verify order","Verifica ordine", "Verificar pedido"],
  "搜索列表": ["Search list","Cerca nell'elenco", "Buscar en la lista"],
  "按所选门店和下单时间查询，核对订单和商品后确认提货。": ["Filter by store and order date. Verify the order and products before confirming pickup.","Filtra per negozio e data ordine. Verifica ordine e prodotti prima di confermare il ritiro.", "Filtre por tienda y fecha de pedido. Verifique el pedido y los productos antes de confirmar la recogida."],
  "展示所选期间新建或收到款项的订单，支持查看和补打小票。": ["Orders created or paid during the selected period. View details or reprint receipts.","Ordini creati o pagati nel periodo selezionato. Consulta i dettagli o ristampa le ricevute.", "Pedidos creados o pagados durante el período seleccionado. Consulte detalles o reimprima recibos."],
  "门店销售": ["Store sale","Vendita in negozio", "Venta en tienda"],
  "配送": ["Delivery","Consegna", "Entrega"],
  "查看 / 打印": ["View / Print","Visualizza / Stampa", "Ver / Imprimir"],
  "单据与小票": ["Orders and receipts","Ordini e ricevute", "Pedidos y recibos"],
  "门店编号": ["Store code","Codice negozio", "Código de tienda"],
  "所属门店 / 角色": ["Stores / Roles","Negozi / Ruoli", "Tiendas / Roles"],
  "请至少选择一家所属门店": ["Assign at least one store","Assegna almeno un negozio", "Asigne al menos una tienda"],
  "门店新增": ["New store","Nuovo negozio", "Nueva tienda"],
  "用户新增": ["New user","Nuovo utente", "Nuevo usuario"],
  "门店搜索": ["Search stores","Cerca negozi", "Buscar tiendas"],
  "用户搜索": ["Search users","Cerca utenti", "Buscar usuarios"],
  "名称、编号、地址": ["Name, code, or address","Nome, codice o indirizzo", "Nombre, código o dirección"],
  "姓名、账号、所属门店": ["Name, account, or store","Nome, account o negozio", "Nombre, cuenta o tienda"],
  "用户": ["User","Utente", "Usuario"],
  "新增": ["Add","Aggiungi", "Añadir"],
  "门店名称": ["Store name","Nome negozio", "Nombre de tienda"],
  "姓名": ["Name","Nome", "Nombre"],
  "联系电话": ["Phone","Telefono", "Teléfono"],
  "允许店长／管理员改价": ["Allow manager / administrator price changes","Consenti modifiche prezzo a responsabili / amministratori", "Permitir cambios de precio por responsables / administradores"],
  "获准的店长或管理员改价时必须填写原因，系统会保留原价和操作记录。": ["Authorized managers must provide a reason for price changes. The original price and activity are recorded.","I responsabili autorizzati devono motivare le modifiche. Il prezzo originale e l'attività vengono registrati.", "Los responsables autorizados deben indicar el motivo del cambio de precio. Se registran el precio original y la actividad."],
  "营业时间": ["Opening hours","Orari di apertura", "Horario de apertura"],
  "新门店归属当前账号的默认公司，并将你关联为店长。": ["New stores belong to your default company, with you assigned as manager.","I nuovi negozi appartengono alla tua azienda predefinita e ti assegnano come responsabile.", "Las tiendas nuevas pertenecen a su empresa predeterminada y usted será su responsable."],
  "新密码（留空不修改）": ["New password (leave blank to keep)","Nuova password (vuoto per mantenere)", "Nueva contraseña (en blanco para conservar)"],
  "登录密码": ["Sign-in password","Password di accesso", "Contraseña de acceso"],
  "所属门店与角色": ["Assigned stores and roles","Negozi e ruoli assegnati", "Tiendas y roles asignados"],
  "家": ["stores","negozi", " tiendas"],
  "角色": ["Role","Ruolo", "Rol"],
  "店员": ["Staff","Addetto", "Empleado"],
  "店长": ["Manager","Responsabile", "Responsable"],
  "同一账号可以加入多家门店，并为每家门店分别设置角色。取消勾选后将移除该门店权限。": ["An account can have different roles in multiple stores. Unchecking a store removes access.","Un account può avere ruoli diversi in più negozi. Deselezionare un negozio rimuove l'accesso.", "Una cuenta puede tener distintos roles en varias tiendas. Desmarcar una tienda elimina el acceso."],
  "姓名、账号和密码属于统一登录资料，修改会影响此账号的所有门店登录。": ["Name, account, and password are shared across all stores. Changes affect every store sign-in.","Nome, account e password sono condivisi tra tutti i negozi. Le modifiche influenzano tutti gli accessi.", "El nombre, la cuenta y la contraseña se comparten entre tiendas. Los cambios afectan a todos los accesos."],
  "校验通过 · 将新建分类": ["Valid · New category will be created","Valido · Verrà creata una nuova categoria", "Válido · Se creará una categoría nueva"],
  "待校验": ["Pending validation","Da convalidare", "Pendiente de validación"],
  "文件不能超过 5MB": ["File must not exceed 5 MB","Il file non deve superare 5 MB", "El archivo no debe superar 5 MB"],
  "请选择 JPG、PNG 或 WebP 图片": ["Choose a JPG, PNG, or WebP image","Scegli un'immagine JPG, PNG o WebP", "Elija una imagen JPG, PNG o WebP"],
  "图片不能超过 2000 万像素": ["Image must not exceed 20 megapixels","L'immagine non deve superare 20 megapixel", "La imagen no debe superar 20 megapíxeles"],
  "示例商品": ["Sample product","Prodotto di esempio", "Producto de ejemplo"],
  "食品 / 休闲零食 / 坚果": ["Food / Snacks / Nuts","Alimenti / Snack / Frutta secca", "Alimentación / Aperitivos / Frutos secos"],
  "500g / 袋": ["500g / bag","500g / confezione", "500 g / bolsa"],
  "可选": ["Optional","Facoltativo", "Opcional"],
  "RO-POS-单机商品导入模板.xlsx": ["RO-POS-product-import-template.xlsx","RO-POS-modello-importazione-prodotti.xlsx", "RO-POS-plantilla-productos.xlsx"],
  "请上传 .xlsx 文件": ["Upload an .xlsx file","Carica un file .xlsx", "Suba un archivo .xlsx"],
  "Excel 中没有可导入的数据": ["No importable data in the spreadsheet","Nessun dato importabile nel foglio", "La hoja no contiene datos importables"],
  "表头必须包含商品名称、分类和售价": ["Headers must include product name, category, and price","Le intestazioni devono includere nome prodotto, categoria e prezzo", "Las cabeceras deben incluir nombre, categoría y precio"],
  "每次最多导入 500 行商品": ["Import up to 500 rows at a time","Importa fino a 500 righe alla volta", "Importe hasta 500 filas cada vez"],
  "已创建 {0} 件商品": ["Created {0} products","Creati {0} prodotti", "{0} productos creados"],
  "上次": ["Previous","Precedente", "Anterior"],
  "件商品的提交结果待确认，请核实原提交，避免重复创建。": ["products are pending confirmation. Verify the previous submission to avoid duplicates.","prodotti in attesa di conferma. Verifica l'invio precedente per evitare duplicati.", "productos pendientes de confirmación. Verifique el envío anterior para evitar duplicados."],
  "使用模板中的完整分类名称；每批最多 500 行，上传后直接进入预览校验。": ["Use full category paths from the template. Up to 500 rows per batch; uploads go directly to validation.","Usa i percorsi completi delle categorie dal modello. Massimo 500 righe; dopo il caricamento si passa alla convalida.", "Use rutas completas de categoría de la plantilla. Hasta 500 filas por lote; la subida pasa directamente a validación."],
  "商品名称 *": ["Product name *","Nome prodotto *", "Nombre del producto *"],
  "售价（元）*": ["Price (CNY) *","Prezzo (CNY) *", "Precio (CNY) *"],
  "行通过 ·": ["valid rows ·","righe valide ·", "filas válidas ·"],
  "行错误": ["invalid rows","righe non valide", "filas no válidas"],
  "商品校验预览": ["Product validation preview","Anteprima convalida prodotti", "Vista previa de validación de productos"],
  "{0} 第 {1} 行": ["{0}, row {1}","{0}, riga {1}", "{0}, fila {1}"],
  "件商品": ["products","prodotti", "productos"],
  "图片暂不可用": ["Image unavailable","Immagine non disponibile", "Imagen no disponible"],
  "暂无图片": ["No image","Nessuna immagine", "Sin imagen"],
  "空白行": ["Blank row","Riga vuota", "Fila vacía"],
  "请复制表头下方的商品数据": ["Copy product data below the headers","Copia i dati prodotto sotto le intestazioni", "Copie los productos debajo de las cabeceras"],
  "粘贴后超过 500 行，请分批录入": ["More than 500 rows. Paste in smaller batches.","Oltre 500 righe. Incolla in gruppi più piccoli.", "Más de 500 filas. Pegue lotes más pequeños."],
  "粘贴内容超出右侧列边界，请从更靠左的单元格粘贴": ["Data exceeds the last column. Paste from a cell further left.","I dati superano l'ultima colonna. Incolla da una cella più a sinistra.", "Los datos superan la última columna. Pegue desde una celda más a la izquierda."],
  "商品编辑表格": ["Product spreadsheet","Foglio prodotti", "Hoja de productos"],
  "选中格子直接粘贴，Tab 横移，Enter 下移": ["Select a cell to paste. Tab moves right; Enter moves down.","Seleziona una cella e incolla. Tab sposta a destra, Invio in basso.", "Seleccione una celda para pegar. Tab avanza a la derecha; Enter baja."],
  "新增行": ["Add row","Aggiungi riga", "Añadir fila"],
  "删除第": ["Delete row","Elimina riga", "Eliminar fila"],
  "行": ["row","riga", "fila"],
  "空白行不提交；分类填写完整路径；条码保留前导零。每批最多 500 行。": ["Blank rows are skipped. Enter full category paths. Barcode leading zeros are preserved. Up to 500 rows per batch.","Le righe vuote sono ignorate. Inserisci percorsi categoria completi. Gli zeri iniziali dei codici vengono conservati. Massimo 500 righe per gruppo.", "Se omiten filas vacías. Use rutas completas de categoría. Se conservan los ceros iniciales de los códigos. Máximo 500 filas por lote."],
  "已打开浏览器打印窗口，请在窗口中确认打印结果": ["Print window opened. Confirm the result there.","Finestra di stampa aperta. Conferma il risultato nella finestra.", "Ventana de impresión abierta. Confirme allí el resultado."],
  "小票宽度": ["Receipt width","Larghezza ricevuta", "Ancho del recibo"],
  "浏览器打印时选择同宽纸张，关闭页眉页脚。": ["Choose matching paper width and disable headers and footers when printing.","Scegli carta della stessa larghezza e disattiva intestazioni e piè di pagina.", "Seleccione el ancho de papel correspondiente y desactive las cabeceras y pies al imprimir."],
  "已取消 · 非收款凭证": ["Cancelled · Not proof of payment","Annullato · Non è una prova di pagamento", "Cancelado · No acredita el pago"],
  "待付款订单 · 非收款凭证": ["Unpaid order · Not proof of payment","Ordine non pagato · Non è una prova di pagamento", "Pedido sin pagar · No acredita el pago"],
  "时间": ["Time","Data e ora", "Hora"],
  "收银": ["Cashier","Cassiere", "Cajero"],
  "方式": ["Method","Metodo", "Método"],
  "已核销提货": ["Pickup fulfilled","Ritiro completato", "Recogida completada"],
  "请妥善保管小票 · 感谢惠顾": ["Keep your receipt · Thank you","Conserva la ricevuta · Grazie", "Conserve su recibo · Gracias"],
  "请先联网准备当前门店离线商品": ["Connect to prepare offline products for this store","Connettiti per preparare i prodotti offline del negozio", "Conéctese para preparar los productos sin conexión de esta tienda"],
  "离线仅支持门店现金单，请取消优惠券、积分及附加服务": ["Offline mode supports cash only. Remove coupons, points, and extra services.","La modalità offline supporta solo contanti. Rimuovi coupon, punti e servizi aggiuntivi.", "Sin conexión solo se admite efectivo. Quite cupones, puntos y servicios adicionales."],
  "商品缓存不完整，请联网更新离线数据": ["Product cache is incomplete. Connect to update it.","Cache prodotti incompleta. Connettiti per aggiornarla.", "La caché de productos está incompleta. Conéctese para actualizarla."],
  "未找到会员，请核对会员码或手机号": ["Member not found. Check the member code or phone.","Socio non trovato. Verifica codice socio o telefono.", "Socio no encontrado. Compruebe el código o teléfono."],
  "订单正在结算，请完成后重新扫描": ["Checkout in progress. Finish before scanning again.","Pagamento in corso. Completalo prima di scansionare di nuovo.", "Cobro en curso. Finalice antes de volver a escanear."],
  "未找到商品": ["Product not found","Prodotto non trovato", "Producto no encontrado"],
  "未找到会员，请核对会员码、卡号或手机号": ["Member not found. Check code, card number, or phone.","Socio non trovato. Verifica codice, tessera o telefono.", "Socio no encontrado. Compruebe código, tarjeta o teléfono."],
  "找到多位会员，请核对后选择": ["Multiple members found. Verify and select one.","Trovati più soci. Verifica e selezionane uno.", "Se encontraron varios socios. Verifique y seleccione uno."],
  "浏览器存储不可用，挂单未保存，请勿关闭当前购物车": ["Browser storage unavailable. Order not held. Keep this cart open.","Memoria del browser non disponibile. Ordine non sospeso. Mantieni aperto il carrello.", "Almacenamiento del navegador no disponible. Pedido no aparcado. Mantenga este carrito abierto."],
  "最多保留 20 笔挂单，请先处理已有挂单": ["Up to 20 held orders. Process existing orders first.","Massimo 20 ordini sospesi. Elabora prima quelli esistenti.", "Máximo 20 pedidos aparcados. Procese los existentes primero."],
  "已挂单，保存在当前设备及员工门店下": ["Order held on this device for the current staff member and store","Ordine sospeso su questo dispositivo per il dipendente e negozio attuali", "Pedido aparcado en este dispositivo para el empleado y tienda actuales"],
  "取回这笔挂单将替换当前购物车。如需保留商品，请取消并先挂单。": ["Recalling replaces your cart. Cancel and hold the current order first to keep it.","Riprendere l'ordine sostituisce il carrello. Annulla e sospendi prima l'ordine attuale per conservarlo.", "Recuperar sustituye su carrito. Cancele y aparque primero el pedido actual para conservarlo."],
  "已取回挂单，商品价格和库存将在结算时重新核算": ["Order recalled. Prices and stock will be checked at checkout.","Ordine ripreso. Prezzi e scorte saranno verificati al pagamento.", "Pedido recuperado. Se comprobarán precios y existencias al cobrar."],
  "删除后无法取回这笔挂单，确认删除？": ["This held order cannot be recovered after deletion. Delete it?","L'ordine sospeso non sarà recuperabile. Eliminarlo?", "Este pedido aparcado no podrá recuperarse tras eliminarlo. ¿Eliminar?"],
  "原订单待核实，请联网后继续原订单": ["Original order needs verification. Connect to continue it.","Ordine originale da verificare. Connettiti per continuarlo.", "El pedido original requiere verificación. Conéctese para continuar."],
  "请重新核算": ["Recalculate before continuing","Ricalcola prima di continuare", "Recalcule antes de continuar"],
  "请输入有效现金实收，不能低于应收金额（最多两位小数）": ["Enter valid cash received, at least the amount due, with up to two decimals","Inserisci contanti validi, almeno pari al dovuto, con massimo due decimali", "Introduzca efectivo válido, igual o superior al total pendiente, con hasta dos decimales"],
  "单机-": ["Local-","Locale-", "Local-"],
  "离线-": ["Offline-","Offline-", "Sin-conexion-"],
  "现金已收": ["Cash received","Contanti ricevuti", "Efectivo recibido"],
  "现金已收 · 待同步": ["Cash received · Pending sync","Contanti ricevuti · Da sincronizzare", "Efectivo recibido · Pendiente de sincronización"],
  "现金单已保存在本机，可在业绩看板查看并导出备份。": ["Cash order saved locally. View it in the dashboard and export a backup.","Ordine in contanti salvato localmente. Consultalo nella dashboard ed esporta un backup.", "Pedido en efectivo guardado localmente. Consúltelo en el panel y exporte una copia."],
  "现金单已保存在本机，云端确认入账后自动清理本地记录。": ["Cash order saved locally. The local record is removed after cloud confirmation.","Ordine in contanti salvato localmente. Il record locale viene rimosso dopo la conferma nel cloud.", "Pedido en efectivo guardado localmente. El registro local se elimina tras confirmar en la nube."],
  "订单结果待确认，购物车已保留，请联网后继续原订单": ["Order result unconfirmed. Cart kept. Connect to continue the original order.","Esito ordine da confermare. Carrello conservato. Connettiti per continuare l'ordine originale.", "Resultado del pedido sin confirmar. Carrito conservado. Conéctese para continuar el pedido original."],
  "已切换离线现金收银：会员优惠暂停；附加服务请移除后结算": ["Switched to offline cash checkout. Member discounts are paused; remove extra services before paying.","Passaggio alla cassa contanti offline. Sconti socio sospesi; rimuovi i servizi aggiuntivi prima di pagare.", "Activado el cobro en efectivo sin conexión. Descuentos de socio suspendidos; quite los servicios adicionales antes de pagar."],
  "请等待扫码完成": ["Wait for scanning to finish","Attendi il completamento della scansione", "Espere a que termine el escaneo"],
  "当前门店仅允许获准的店长或管理员改价": ["Only authorized managers or administrators may change prices","Solo responsabili o amministratori autorizzati possono modificare i prezzi", "Solo los responsables o administradores autorizados pueden cambiar precios"],
  "请输入 0 至 1000000 元、最多两位小数的成交单价": ["Enter a unit price from 0 to 1,000,000 CNY with up to two decimals","Inserisci un prezzo unitario da 0 a 1.000.000 CNY con massimo due decimali", "Introduzca un precio unitario entre 0 y 1.000.000 CNY con hasta dos decimales"],
  "清空当前订单": ["Clear current order","Svuota ordine attuale", "Vaciar pedido actual"],
  "将移除当前购物车中的全部商品，确认清空？": ["Remove all products from the cart?","Rimuovere tutti i prodotti dal carrello?", "¿Quitar todos los productos del carrito?"],
  "充值记录保存失败，请从订单列表核对": ["Could not save top-up record. Verify it in Orders.","Impossibile salvare la ricarica. Verifica in Ordini.", "No se pudo guardar la recarga. Verifíquela en Pedidos."],
  "订单已取消，但本机记录保存失败，请勿关闭页面": ["Order cancelled, but local save failed. Keep this page open.","Ordine annullato, ma salvataggio locale non riuscito. Mantieni aperta la pagina.", "Pedido cancelado, pero falló el guardado local. Mantenga esta página abierta."],
  "已返回收银台，购物车已保留": ["Back at checkout. Cart retained.","Ritorno alla cassa. Carrello conservato.", "De vuelta en caja. Carrito conservado."],
  "请联网后核实原订单，购物车已保留": ["Connect to verify the original order. Cart retained.","Connettiti per verificare l'ordine originale. Carrello conservato.", "Conéctese para verificar el pedido original. Carrito conservado."],
  "请先核实当前订单的支付结果": ["Verify this order's payment result first","Verifica prima l'esito del pagamento di questo ordine", "Verifique primero el resultado del pago de este pedido"],
  "订单尚未取消，请核实当前状态": ["Order not cancelled. Verify its status.","Ordine non annullato. Verifica lo stato.", "Pedido no cancelado. Verifique su estado."],
  "取消未完成，请重试或核实原订单：": ["Cancellation incomplete. Retry or verify the original order:","Annullamento incompleto. Riprova o verifica l'ordine originale:", "Cancelación incompleta. Reintente o verifique el pedido original:"],
  "当前订单 ·": ["Current order ·","Ordine attuale ·", "Pedido actual ·"],
  "件": ["items","articoli", "artículos"],
  "购物车已保留 ·": ["Cart retained ·","Carrello conservato ·", "Carrito conservado ·"],
  "订单结果待确认": ["Order result unconfirmed","Esito ordine da confermare", "Resultado del pedido sin confirmar"],
  "，请继续原订单或取消未付款订单。": [". Continue the original order or cancel the unpaid order.",". Continua l'ordine originale o annulla quello non pagato.", ". Continúe el pedido original o cancele el pedido sin pagar."],
  "继续原订单": ["Continue original order","Continua ordine originale", "Continuar pedido original"],
  "选择": ["Select","Seleziona", "Seleccionar"],
  "数量：": ["Quantity:","Quantità:", "Cantidad:"],
  "当前订单会员": ["Current order member","Socio dell'ordine attuale", "Socio del pedido actual"],
  "更换": ["Change","Cambia", "Cambiar"],
  "全部商品分类": ["All product categories","Tutte le categorie prodotto", "Todas las categorías"],
  "正在处理": ["Processing","Elaborazione", "Procesando"],
  "次扫码…": ["scans…","scansioni…", "escaneos…"],
  "正在加载商品…": ["Loading products…","Caricamento prodotti…", "Cargando productos…"],
  "二级分类": ["Subcategories","Sottocategorie", "Subcategorías"],
  "查看商品": ["View products","Vedi prodotti", "Ver productos"],
  "{0} 件商品": ["{0} products","{0} prodotti", "{0} productos"],
  "添加": ["Add","Aggiungi", "Añadir"],
  "已售罄": ["Sold out","Esaurito", "Agotado"],
  "加载中…": ["Loading…","Caricamento…", "Cargando…"],
  "确认会员": ["Confirm member","Conferma socio", "Confirmar socio"],
  "关闭会员确认": ["Close member confirmation","Chiudi conferma socio", "Cerrar confirmación de socio"],
  "会员码 / 手机号": ["Member code / Phone","Codice socio / Telefono", "Código de socio / Teléfono"],
  "待确认会员": ["Member to confirm","Socio da confermare", "Socio por confirmar"],
  "未填写": ["Not provided","Non indicato", "No indicado"],
  "确认会员后，将关联到当前购物车。": ["Confirm to link this member to the current cart.","Conferma per associare il socio al carrello attuale.", "Confirme para vincular este socio al carrito actual."],
  "确认使用该会员": ["Use this member","Usa questo socio", "Usar este socio"],
  "结算与打印": ["Payment and printing","Pagamento e stampa", "Pago e impresión"],
  "小票": ["Receipt","Ricevuta", "Recibo"],
  "收款界面": ["Payment screen","Schermata pagamento", "Pantalla de pago"],
  "正在准备收款，请稍候…": ["Preparing payment. Please wait…","Preparazione pagamento. Attendi…", "Preparando el pago. Espere…"],
  "原订单结果待确认，请继续原订单，避免重复开单。": ["The original order is unconfirmed. Continue it to avoid creating a duplicate.","Ordine originale da confermare. Continualo per evitare duplicati.", "El pedido original no está confirmado. Continúe para evitar duplicarlo."],
  "核实原订单": ["Verify original order","Verifica ordine originale", "Verificar pedido original"],
  "扫描会员码 / 输入手机号": ["Scan member code / Enter phone","Scansiona codice socio / Inserisci telefono", "Escanear código de socio / Introducir teléfono"],
  "扫描会员码，或输入会员码、手机号": ["Scan or enter member code or phone","Scansiona o inserisci codice socio o telefono", "Escanee o introduzca código de socio o teléfono"],
  "当前会员": ["Current member","Socio attuale", "Socio actual"],
  "本单优惠": ["Order discounts","Sconti ordine", "Descuentos del pedido"],
  "离线会员信息来自本机缓存，积分、优惠券暂不可用。": ["Offline member details are cached. Points and coupons are unavailable.","I dati socio offline provengono dalla cache. Punti e coupon non sono disponibili.", "Los datos del socio sin conexión son una copia guardada. No se admiten puntos ni cupones."],
  "未获取": ["Unavailable","Non disponibile", "No disponible"],
  "不使用优惠券": ["No coupon","Nessun coupon", "Sin cupón"],
  "正在核算优惠…": ["Calculating discounts…","Calcolo sconti…", "Calculando descuentos…"],
  "扫码后自动显示会员、积分和可用优惠券": ["Scan to view the member, points, and available coupons","Scansiona per vedere socio, punti e coupon disponibili", "Escanee para ver el socio, puntos y cupones disponibles"],
  "也可输入手机号，按回车查询": ["Or enter a phone number and press Enter","Oppure inserisci il telefono e premi Invio", "O introduzca un teléfono y pulse Enter"],
  "应付": ["Amount due","Importo dovuto", "Importe pendiente"],
  "关闭移除确认": ["Close removal confirmation","Chiudi conferma rimozione", "Cerrar confirmación de eliminación"],
  "商品改价": ["Change product price","Modifica prezzo prodotto", "Cambiar precio del producto"],
  "关闭改价": ["Close price change","Chiudi modifica prezzo", "Cerrar cambio de precio"],
  "原单价": ["Original unit price","Prezzo unitario originale", "Precio unitario original"],
  "当前小计": ["Current subtotal","Subtotale attuale", "Subtotal actual"],
  "成交单价（元）": ["Sale unit price (CNY)","Prezzo unitario di vendita (CNY)", "Precio unitario de venta (CNY)"],
  "改价原因": ["Price-change reason","Motivo modifica prezzo", "Motivo del cambio de precio"],
  "确认改价": ["Confirm price change","Conferma modifica prezzo", "Confirmar cambio de precio"],
  "识别会员": ["Find member","Cerca socio", "Buscar socio"],
  "扫描 / 输入名称、会员码、卡号、手机号": ["Scan / Enter name, member code, card number, or phone","Scansiona / Inserisci nome, codice socio, tessera o telefono", "Escanee / Introduzca nombre, código de socio, tarjeta o teléfono"],
  "识别": ["Find","Cerca", "Buscar"],
  "当前余额": ["Current balance","Saldo attuale", "Saldo actual"],
  "更换会员": ["Change member","Cambia socio", "Cambiar socio"],
  "此处办理会员业务，当前销售购物车保持不变。": ["Manage member services here. The sales cart is kept.","Gestisci qui i servizi socio. Il carrello di vendita viene conservato.", "Gestione aquí los servicios del socio. Se conserva el carrito de venta."],
  "挂单仅保存在当前设备，取回后重新核算价格与库存。": ["Held orders are saved on this device only. Prices and stock are checked again on recall.","Gli ordini sospesi sono salvati solo su questo dispositivo. Prezzi e scorte sono ricontrollati alla ripresa.", "Los pedidos aparcados se guardan solo en este dispositivo. Los precios y existencias se comprueban al recuperarlos."],
  "暂无挂单": ["No held orders","Nessun ordine sospeso", "No hay pedidos aparcados"],
  "种商品": ["product types","tipi di prodotto", " tipos de producto"],
  "取回": ["Recall","Riprendi", "Recuperar"],
  "保存备注": ["Save notes","Salva note", "Guardar notas"],
  "支持 F2–F4、F6–F9、Enter 或 Ctrl+Alt+字母。": ["Use F2–F4, F6–F9, Enter, or Ctrl+Alt+letter.","Usa F2–F4, F6–F9, Invio o Ctrl+Alt+lettera.", "Use F2–F4, F6–F9, Enter o Ctrl+Alt+letra."],
  "点击按键框后按下快捷键。设置仅用于当前员工在此浏览器的收银操作。": ["Click a key field, then press a shortcut. These settings apply only to the current staff member in this browser.","Clicca sul campo e premi una scorciatoia. Le impostazioni valgono solo per il dipendente attuale in questo browser.", "Pulse un campo de tecla y después el atajo. Estos ajustes solo afectan al empleado actual en este navegador."],
  "支持 F2–F4、F6–F9、Enter、Ctrl+Alt+字母。部分键盘需同时按 Fn。输入框和弹窗内暂停快捷操作，扫码收款仍需确认。": ["Use F2–F4, F6–F9, Enter, or Ctrl+Alt+letter. Some keyboards also require Fn. Shortcuts pause in input fields and dialogs. Scan payments still require confirmation.","Usa F2–F4, F6–F9, Invio o Ctrl+Alt+lettera. Alcune tastiere richiedono anche Fn. Le scorciatoie sono sospese nei campi e nelle finestre. I pagamenti tramite codice richiedono conferma.", "Use F2–F4, F6–F9, Enter o Ctrl+Alt+letra. Algunos teclados requieren Fn. Los atajos se suspenden en campos y diálogos. Los pagos escaneados requieren confirmación."],
  "未启用": ["Not enabled","Non attivo", "No activado"],
  "禁用": ["Disable","Disattiva", "Desactivar"],
  "快捷键重复，请更换按键或禁用其中一项。": ["Duplicate shortcuts. Change a key or disable one action.","Scorciatoie duplicate. Cambia un tasto o disattiva un'azione.", "Atajos duplicados. Cambie una tecla o desactive una acción."],
  "恢复默认": ["Restore defaults","Ripristina predefiniti", "Restaurar valores predeterminados"],
  "保存设置": ["Save settings","Salva impostazioni", "Guardar ajustes"],
  "分类已更新": ["Category updated","Categoria aggiornata", "Categoría actualizada"],
  "分类已创建": ["Category created","Categoria creata", "Categoría creada"],
  "该分类包含商品或下级分类，不能删除": ["Cannot delete a category containing products or subcategories","Impossibile eliminare una categoria con prodotti o sottocategorie", "No se puede eliminar una categoría con productos o subcategorías"],
  "删除商品分类": ["Delete product category","Elimina categoria prodotto", "Eliminar categoría de productos"],
  "确认删除分类“{0}”？": ["Delete category “{0}”?","Eliminare la categoria “{0}”?", "¿Eliminar la categoría «{0}»?"],
  "分类已删除": ["Category deleted","Categoria eliminata", "Categoría eliminada"],
  "包含下级": ["Has subcategories","Contiene sottocategorie", "Tiene subcategorías"],
  "暂无分类": ["No categories","Nessuna categoria", "Sin categorías"],
  "编辑分类": ["Edit category","Modifica categoria", "Editar categoría"],
  "分类名称 *": ["Category name *","Nome categoria *", "Nombre de categoría *"],
  "无（一级分类）": ["None (top-level category)","Nessuna (categoria principale)", "Ninguna (categoría superior)"],
  "选择上级后会移动整个分类；不能移动到自身或下级。": ["Selecting a parent moves the entire category. It cannot be moved into itself or its descendants.","Selezionando un genitore si sposta l'intera categoria. Non può essere spostata in sé stessa o nei discendenti.", "Elegir un padre mueve toda la categoría. No puede moverse a sí misma ni a sus descendientes."],
  "请选择": ["Select an option", "Seleziona un’opzione", "Seleccione una opción"],
  "请选择门店": ["Select a store","Seleziona un negozio", "Seleccione una tienda"],
  "全部门店（{0}）": ["All stores ({0})","Tutti i negozi ({0})", "Todas las tiendas ({0})"],
  "已选 1 家": ["1 store selected","1 negozio selezionato", "1 tienda seleccionada"],
  "已选 {0} 家门店": ["{0} stores selected","{0} negozi selezionati", "{0} tiendas seleccionadas"],
  "门店筛选：{0}": ["Store filter: {0}","Filtro negozi: {0}", "Filtro de tiendas: {0}"],
  "全选": ["Select all","Seleziona tutto", "Seleccionar todo"],
  "暂无可管理门店": ["No stores available to manage","Nessun negozio da gestire", "No hay tiendas disponibles para gestionar"],
  "正在加载业绩数据…": ["Loading performance data…","Caricamento dati prestazioni…", "Cargando resultados…"],
  "笔销售订单": ["sales orders","ordini di vendita", "pedidos de venta"],
  "不含赠送金额": ["Excludes bonuses","Esclusi i bonus", "No incluye bonificaciones"],
  "退款数据暂不可统计": ["Refund data unavailable","Dati rimborsi non disponibili", "Datos de reembolsos no disponibles"],
  "每日收款": ["Daily receipts","Incassi giornalieri", "Cobros diarios"],
  "金额趋势": ["Amount trend","Andamento importi", "Evolución del importe"],
  "所选日期每小时收款趋势": ["Hourly receipts for the selected date","Incassi orari per la data selezionata", "Cobros por hora de la fecha seleccionada"],
  "所选期间每日收款趋势": ["Daily receipts for the selected period","Incassi giornalieri per il periodo selezionato", "Cobros diarios del período seleccionado"],
  "金额（元）": ["Amount (CNY)","Importo (CNY)", "Importe (CNY)"],
  "时段": ["Time period","Fascia oraria", "Franja horaria"],
  "单日": ["Day","Giorno", "Día"],
  "峰值": ["Peak","Picco", "Máximo"],
  "所选期间各收款方式金额占比饼图": ["Payment method share for the selected period","Quota per metodo di pagamento nel periodo selezionato", "Distribución de métodos de pago del período seleccionado"],
  "／ 找零": ["/ Change","/ Resto", "/ Cambio"],
  "统计所选门店和日期区间内已确认的收款，不含本机待同步记录；实收尚未扣除退款。分次付款按期间到账金额计入。销售收款客单价为期间商品销售收款除以对应销售订单数，不含会员充值。后台暂无可核对的退款金额与完成时间数据，退款和净收暂不可统计。": ["Confirmed receipts for the selected stores and dates, excluding local records pending sync and before refunds. Split payments count when received. Average sale is product receipts divided by sales orders, excluding top-ups. Refund totals and completion dates are unavailable, so refunds and net receipts cannot yet be calculated.","Incassi confermati per negozi e date selezionati, esclusi i record locali da sincronizzare e prima dei rimborsi. I pagamenti frazionati contano alla ricezione. Lo scontrino medio è dato dagli incassi prodotti divisi per gli ordini, escluse le ricariche. Importi e date dei rimborsi non sono disponibili, quindi rimborsi e netto non sono calcolabili.", "Cobros confirmados de las tiendas y fechas seleccionadas, sin registros locales pendientes de sincronización y antes de reembolsos. Los pagos divididos se cuentan al cobrarse. El ticket medio divide los cobros de productos entre pedidos, sin recargas. No se dispone de importes ni fechas de reembolso, por lo que no pueden calcularse reembolsos ni cobros netos."],
  "请求超时，结果待确认，请先核实原单据": ["Request timed out. Verify the original transaction before retrying.","Richiesta scaduta. Verifica la transazione originale prima di riprovare.", "Tiempo de espera agotado. Verifique la operación original antes de reintentar."],
  "已切换到单机版": ["Switched to standalone mode","Passaggio alla modalità locale", "Activado el modo local"],
  "本机缓存写入失败，相关资料离线不可用": ["Cache write failed. This data is unavailable offline.","Scrittura cache non riuscita. Dati non disponibili offline.", "Error al guardar la caché. Estos datos no estarán disponibles sin conexión."],
  "请输入完整的睿鸥后台地址，例如 https://pos.example.com": ["Enter the full Ruiou Back Office URL, e.g. https://pos.example.com","Inserisci l'URL completo di Ruiou Back Office, ad es. https://pos.example.com", "Introduzca la URL completa de Ruiou Back Office, p. ej. https://pos.example.com"],
  "后台地址不能包含账号、密码、查询参数或锚点": ["The URL must not contain credentials, query parameters, or fragments","L'URL non deve contenere credenziali, parametri o frammenti", "La URL no debe contener credenciales, parámetros ni fragmentos"],
  "正式环境必须使用 HTTPS；本机或局域网调试可使用 HTTP": ["Use HTTPS in production. HTTP is allowed for local testing.","Usa HTTPS in produzione. HTTP è consentito per test locali.", "Use HTTPS en producción. HTTP se permite para pruebas locales."],
  "离线页面缓存注册失败：需要 HTTPS 或 localhost": ["Offline cache registration failed: HTTPS or localhost required","Registrazione cache offline non riuscita: richiesto HTTPS o localhost", "Error al registrar la caché sin conexión: se requiere HTTPS o localhost"],
  "本机存储不可用，请勿离线收款": ["Local storage unavailable. Do not take offline payments.","Memoria locale non disponibile. Non accettare pagamenti offline.", "Almacenamiento local no disponible. No realice cobros sin conexión."],
  "保存失败，请勿关闭页面或重复收款": ["Save failed. Keep the page open and do not charge again.","Salvataggio non riuscito. Mantieni aperta la pagina e non ripetere l'addebito.", "Error al guardar. Mantenga la página abierta y no vuelva a cobrar."],
  "本机保存失败，请勿重复收款": ["Local save failed. Do not charge again.","Salvataggio locale non riuscito. Non ripetere l'addebito.", "Error al guardar localmente. No vuelva a cobrar."],
  "请先联网登录并选择门店": ["Connect, sign in, and select a store first","Prima connettiti, accedi e seleziona un negozio", "Conéctese, inicie sesión y seleccione una tienda primero"],
  "请先联网登录并缓存门店资料，再使用离线收银": ["Sign in online and cache store data before using offline checkout","Accedi online e memorizza i dati del negozio prima di usare la cassa offline", "Inicie sesión online y guarde los datos de la tienda antes de usar la caja sin conexión"],
  "当前门店尚未准备离线商品": ["Offline products are not ready for this store","Prodotti offline non ancora pronti per questo negozio", "Los productos sin conexión no están listos para esta tienda"],
  "当前门店尚未完成自动缓存，请联网后稍候再试": ["Store caching is incomplete. Connect and try again shortly.","Cache negozio incompleta. Connettiti e riprova tra poco.", "La caché de la tienda está incompleta. Conéctese y reintente en breve."],
  "请输入至少两位会员卡号或姓名；离线仅可查询已缓存会员": ["Enter at least two characters of a card number or name. Only cached members are searchable offline.","Inserisci almeno due caratteri di tessera o nome. Offline sono disponibili solo i soci memorizzati.", "Introduzca al menos dos caracteres de tarjeta o nombre. Sin conexión solo se buscan socios guardados."],
  "该会员没有已缓存地址，请联网维护": ["No cached address for this member. Connect to manage addresses.","Nessun indirizzo memorizzato per il socio. Connettiti per gestirli.", "No hay dirección guardada para este socio. Conéctese para gestionar direcciones."],
  "此功能需要连接后台，离线仅支持缓存商品、自提现金单与挂单": ["Connect to use this feature. Offline mode supports cached products, cash pickup orders, and held orders.","Connettiti per usare questa funzione. Offline sono disponibili prodotti memorizzati, ordini in contanti con ritiro e ordini sospesi.", "Conéctese para usar esta función. Sin conexión se admiten productos guardados, recogidas pagadas en efectivo y pedidos aparcados."],
  "离线准备需要 HTTPS 或 localhost": ["Offline setup requires HTTPS or localhost","La preparazione offline richiede HTTPS o localhost", "La configuración sin conexión requiere HTTPS o localhost"],
  "离线页面缓存尚未就绪，请刷新后重试": ["Offline page cache is not ready. Refresh and retry.","Cache pagine offline non pronta. Aggiorna e riprova.", "La caché de páginas no está lista. Actualice y reintente."],
  "连接或门店已变化，请重新准备离线数据": ["Connection or store changed. Prepare offline data again.","Connessione o negozio cambiato. Prepara di nuovo i dati offline.", "La conexión o tienda cambió. Prepare de nuevo los datos sin conexión."],
  "离线订单未保存，请勿清空购物车或重复收款": ["Offline order not saved. Do not clear the cart or charge again.","Ordine offline non salvato. Non svuotare il carrello né ripetere l'addebito.", "Pedido sin conexión no guardado. No vacíe el carrito ni vuelva a cobrar."],
  "无法保存同步结果，下次将安全重试": ["Could not save sync result. A safe retry will follow.","Impossibile salvare l'esito della sincronizzazione. Verrà ritentata in sicurezza.", "No se pudo guardar la sincronización. Se reintentará de forma segura."],
  "请由原收银员登录原门店后同步": ["The original cashier must sign in to the original store to sync","Il cassiere originale deve accedere al negozio originale per sincronizzare", "El cajero original debe iniciar sesión en la tienda original para sincronizar"],
  "云端未确认完整收款，本机记录继续保留": ["Full payment not confirmed in the cloud. Local records are kept.","Pagamento completo non confermato nel cloud. Record locali conservati.", "Pago completo sin confirmar en la nube. Se conservan los registros locales."],
  "同步失败，请重试": ["Sync failed. Try again.","Sincronizzazione non riuscita. Riprova.", "Error de sincronización. Reintente."],
  "粘贴内容过大，请分批录入": ["Pasted content too large. Use smaller batches.","Contenuto troppo grande. Usa gruppi più piccoli.", "Contenido pegado demasiado grande. Use lotes más pequeños."],
  "单元格引号不完整，请重新复制": ["Incomplete cell quotes. Copy the data again.","Virgolette della cella incomplete. Copia di nuovo i dati.", "Comillas de celda incompletas. Copie los datos de nuevo."],
  "每批最多粘贴 500 行数据": ["Paste up to 500 rows per batch","Incolla massimo 500 righe per gruppo", "Pegue hasta 500 filas por lote"],
  "分类完整名称": ["Full category path","Percorso categoria completo", "Ruta completa de categoría"],
  "每批请输入 1 至 500 行": ["Enter 1 to 500 rows per batch","Inserisci da 1 a 500 righe per gruppo", "Introduzca entre 1 y 500 filas por lote"],
  "第 {0} 行超过 7 列，请按指定顺序复制": ["Row {0} exceeds 7 columns. Copy in the specified order.","La riga {0} supera 7 colonne. Copia nell'ordine indicato.", "La fila {0} supera 7 columnas. Copie en el orden indicado."],
  "进入收款": ["Open payment","Apri pagamento", "Abrir cobro"],
  "扫码收款": ["Scan payment","Pagamento tramite codice", "Pago escaneado"],
  "请为每项操作设置不同的有效按键": ["Assign a different valid key to each action","Assegna un tasto valido diverso a ogni azione", "Asigne una tecla válida distinta a cada acción"],
  "浏览器无法保存设置，请检查是否允许本地存储": ["Cannot save settings. Check browser storage permissions.","Impossibile salvare le impostazioni. Verifica i permessi di memoria del browser.", "No se pueden guardar los ajustes. Compruebe los permisos de almacenamiento del navegador."],
  "数据文本格式或长度不正确": ["Invalid text format or length","Formato o lunghezza testo non validi", "Formato o longitud de texto no válidos"],
  "数据标识不正确": ["Invalid data identifier","Identificatore dati non valido", "Identificador de datos no válido"],
  "金额须为有效人民币金额，最多两位小数": ["Enter a valid CNY amount with up to two decimals","Inserisci un importo CNY valido con massimo due decimali", "Introduzca un importe CNY válido con hasta dos decimales"],
  "单机收银员": ["Local cashier","Cassiere locale", "Cajero local"],
  "商品分类层级存在循环": ["Category hierarchy contains a cycle","La gerarchia categorie contiene un ciclo", "La jerarquía de categorías contiene un ciclo"],
  "请选择商品分类或填写完整分类路径": ["Select a category or enter its full path","Seleziona una categoria o inserisci il percorso completo", "Seleccione una categoría o introduzca su ruta completa"],
  "商品分类最多 8 级，每级不超过 80 个字符": ["Categories support up to 8 levels, 80 characters per level","Categorie con massimo 8 livelli e 80 caratteri per livello", "Las categorías admiten 8 niveles, con 80 caracteres por nivel"],
  "请选择末级商品分类，或填写完整分类路径": ["Select a leaf category or enter the full path","Seleziona una categoria finale o inserisci il percorso completo", "Seleccione una categoría final o introduzca la ruta completa"],
  "只能选择最末级商品分类": ["Only leaf categories can be selected","Puoi selezionare solo categorie finali", "Solo se pueden seleccionar categorías finales"],
  "商品图片格式不正确": ["Invalid product image format","Formato immagine prodotto non valido", "Formato de imagen de producto no válido"],
  "商品名称不能为空": ["Product name is required","Nome prodotto obbligatorio", "El nombre del producto es obligatorio"],
  "商品已不存在，请重新选择": ["Product no longer exists. Select another.","Il prodotto non esiste più. Selezionane un altro.", "El producto ya no existe. Seleccione otro."],
  "商品数量不正确": ["Invalid product quantity","Quantità prodotto non valida", "Cantidad de producto no válida"],
  "商品合计有变化，请重新结算": ["Product total changed. Check out again.","Totale prodotti cambiato. Ripeti il pagamento.", "El total ha cambiado. Vuelva a pasar por caja."],
  "现金实收不能小于应收": ["Cash received cannot be less than the amount due","I contanti ricevuti non possono essere inferiori al dovuto", "El efectivo recibido no puede ser inferior al importe pendiente"],
  "会员不存在，请重新选择": ["Member does not exist. Select again.","Socio inesistente. Seleziona di nuovo.", "El socio no existe. Seleccione otro."],
  "相同订单号的内容不一致，不能再次登记": ["This order number has different details and cannot be recorded again","Questo numero ordine ha dettagli diversi e non può essere registrato di nuovo", "Este número de pedido tiene otros datos y no puede registrarse de nuevo"],
  "分类不存在": ["Category does not exist","Categoria inesistente", "La categoría no existe"],
  "分类名称不能为空": ["Category name is required","Nome categoria obbligatorio", "El nombre de categoría es obligatorio"],
  "上级分类不存在": ["Parent category does not exist","Categoria superiore inesistente", "La categoría padre no existe"],
  "不能把分类移动到自身或下级分类": ["Cannot move a category into itself or its descendants","Impossibile spostare una categoria in sé stessa o nei discendenti", "No puede mover una categoría a sí misma ni a sus descendientes"],
  "同一上级下已有同名分类": ["A category with this name already exists under this parent","Esiste già una categoria con questo nome sotto lo stesso genitore", "Ya existe una categoría con este nombre bajo el mismo padre"],
  "该分类包含下级分类，不能删除": ["Cannot delete a category with subcategories","Impossibile eliminare una categoria con sottocategorie", "No se puede eliminar una categoría con subcategorías"],
  "该分类已有商品，不能删除": ["Cannot delete a category containing products","Impossibile eliminare una categoria con prodotti", "No se puede eliminar una categoría con productos"],
  "至少保留一个商品分类": ["Keep at least one product category","Mantieni almeno una categoria prodotto", "Conserve al menos una categoría de productos"],
  "请检查会员姓名和手机号": ["Check member name and phone","Verifica nome e telefono del socio", "Compruebe el nombre y teléfono del socio"],
  "手机号已被其他会员使用": ["Phone number is used by another member","Numero di telefono usato da un altro socio", "Otro socio utiliza este teléfono"],
  "商品不存在": ["Product does not exist","Prodotto inesistente", "El producto no existe"],
  "商品条码或编码重复": ["Duplicate product barcode or code","Codice a barre o codice prodotto duplicato", "Código de barras o producto duplicado"],
  "请至少填写一行商品": ["Enter at least one product row","Inserisci almeno una riga prodotto", "Introduzca al menos una fila de producto"],
  "每次最多导入 {0} 行商品": ["Import up to {0} product rows at a time","Importa massimo {0} righe prodotto alla volta", "Importe hasta {0} filas de productos cada vez"],
  "请检查会员姓名和电话": ["Check member name and phone","Verifica nome e telefono del socio", "Compruebe el nombre y teléfono del socio"],
  "该手机号已存在，请搜索会员": ["Phone number already exists. Search for the member.","Numero già esistente. Cerca il socio.", "El teléfono ya existe. Busque al socio."],
  "每次只能创建 1 至 {0} 件商品": ["Create 1 to {0} products at a time","Crea da 1 a {0} prodotti alla volta", "Cree entre 1 y {0} productos cada vez"],
  "第 {0} 行商品条码或编码重复": ["Duplicate barcode or product code in row {0}","Codice a barre o prodotto duplicato alla riga {0}", "Código de barras o producto duplicado en la fila {0}"],
  "找不到本机订单": ["Local order not found","Ordine locale non trovato", "Pedido local no encontrado"],
  "单机版不支持此功能，请连接睿鸥后台": ["Unavailable in standalone mode. Connect to Ruiou Back Office.","Non disponibile in modalità locale. Collegati a Ruiou Back Office.", "No disponible en modo local. Conéctese a Ruiou Back Office."],
  "不是受支持的 RO POS 单机备份": ["Unsupported RO POS local backup","Backup locale RO POS non supportato", "Copia local de RO POS no compatible"],
  "备份集合格式错误或超过 50000 条": ["Invalid backup collection or more than 50,000 records","Raccolta backup non valida o oltre 50.000 record", "Colección de copia no válida o superior a 50.000 registros"],
  "分类名称为空": ["Empty category name","Nome categoria vuoto", "Nombre de categoría vacío"],
  "分类上级引用不存在": ["Parent category reference not found","Riferimento categoria superiore non trovato", "Referencia de categoría padre no encontrada"],
  "备份缺少商品分类": ["Backup is missing product categories","Categorie prodotto mancanti nel backup", "Faltan categorías de productos en la copia"],
  "会员姓名为空": ["Empty member name","Nome socio vuoto", "Nombre de socio vacío"],
  "备份包含重复标识": ["Backup contains duplicate IDs","Il backup contiene ID duplicati", "La copia contiene identificadores duplicados"],
  "订单明细格式错误": ["Invalid order line format","Formato righe ordine non valido", "Formato de línea de pedido no válido"],
  "订单商品引用或数量错误": ["Invalid product reference or quantity in order","Riferimento prodotto o quantità ordine non validi", "Referencia o cantidad de producto no válida en el pedido"],
  "订单日期不正确": ["Invalid order date","Data ordine non valida", "Fecha de pedido no válida"],
  "订单会员引用不存在": ["Order member reference not found","Riferimento socio dell'ordine non trovato", "Referencia de socio del pedido no encontrada"],
  "订单合计或收款金额不一致": ["Order total or payment amount does not match","Totale ordine o importo pagamento non corrispondenti", "El total del pedido o el pago no coincide"],
  "同一标识内容冲突，请核对后重新导入": ["Conflicting data for the same ID. Verify and import again.","Dati in conflitto per lo stesso ID. Verifica e importa di nuovo.", "Datos en conflicto para el mismo identificador. Verifique y vuelva a importar."],
  "商品条码或编码重复，不能自动合并": ["Duplicate barcode or product code prevents automatic merging","Codice a barre o prodotto duplicato: unione automatica impossibile", "Un código de barras o producto duplicado impide la combinación automática"],
  "会员手机号重复，不能自动合并": ["Duplicate member phone prevents automatic merging","Telefono socio duplicato: unione automatica impossibile", "Un teléfono de socio duplicado impide la combinación automática"],
  "首页": ["Home", "Home", "Inicio"], "公司介绍": ["Company", "Azienda", "Empresa"], "产品展示": ["Products", "Prodotti", "Productos"], "关于我们": ["About us", "Chi siamo", "Sobre nosotros"],
  "界面语言": ["Interface language", "Lingua interfaccia", "Idioma de interfaz"],
  "搜索": ["Search", "Cerca", "Buscar"], "商品搜索": ["Product search", "Ricerca prodotto", "Buscar productos"], "会员搜索": ["Member search", "Ricerca socio", "Buscar socios"], "订单搜索": ["Order search", "Ricerca ordine", "Buscar pedidos"], "商品名称、条码、编码": ["Product name, barcode, or code", "Nome, codice a barre o codice prodotto", "Nombre, código de barras o código de producto"], "姓名、卡号、手机号": ["Name, card number, or phone", "Nome, tessera o telefono", "Nombre, número de tarjeta o teléfono"], "订单号 / 会员姓名 / 手机号": ["Order number / member / phone", "Numero ordine / socio / telefono", "Número de pedido / socio / teléfono"],
  "登录账号": ["Sign in", "Accedi", "Iniciar sesión"], "员工账号": ["Staff account", "Account dipendente", "Cuenta de empleado"], "请输入员工账号": ["Enter staff account", "Inserisci account dipendente", "Introduzca la cuenta del empleado"], "密码": ["Password", "Password", "Contraseña"], "请输入密码": ["Enter password", "Inserisci la password", "Introduzca la contraseña"], "显示密码": ["Show password", "Mostra password", "Mostrar contraseña"], "隐藏密码": ["Hide password", "Nascondi password", "Ocultar contraseña"], "登录工作台": ["Sign in", "Accedi", "Iniciar sesión"], "正在登录…": ["Signing in…", "Accesso…", "Iniciando sesión…"], "正在检查登录状态…": ["Checking session…", "Verifica sessione…", "Comprobando sesión…"],
  "RO POS 门店收银系统，与电商订单协同管理。": ["RO POS store checkout with integrated online orders.", "RO POS per la cassa del negozio e gli ordini online.", "Caja de tienda RO POS con pedidos online integrados."], "一个工作台，连接门店日常": ["One workspace for daily store operations", "Un'unica area per le operazioni quotidiane", "Un área de trabajo para las operaciones diarias de tienda"], "从选购开单到收款提货，让门店操作更集中。": ["From product selection to payment and pickup, all store operations stay together.", "Dalla selezione al pagamento e ritiro, tutte le operazioni restano unite.", "Desde elegir productos hasta cobrar y entregar: toda la tienda en un mismo lugar."], "商品扫码与挂单": ["Barcode scanning and held orders", "Scansione codici e ordini sospesi", "Escaneo de códigos y pedidos aparcados"], "会员建档、充值与发券": ["Member records, top-ups, and coupons", "Anagrafica soci, ricariche e coupon", "Socios, recargas y cupones"], "现金、微信及支付宝收款": ["Cash, WeChat Pay, and Alipay", "Contanti, WeChat Pay e Alipay", "Efectivo, WeChat Pay y Alipay"], "提货核销与小票打印": ["Pickup fulfillment and receipt printing", "Ritiro ordini e stampa scontrini", "Entrega de recogidas e impresión de recibos"], "关于 RO POS": ["About RO POS", "Informazioni su RO POS", "Sobre RO POS"], "面向零售门店的收银工作台，由睿鸥科技提供。": ["A checkout workspace for retail stores by Ruiou Technology.", "Un'area cassa per negozi al dettaglio di Ruiou Technology.", "Un área de caja para comercios de Ruiou Technology."], "员工使用已分配门店权限的账号登录": ["Staff sign in with assigned store access", "Il personale accede con i negozi assegnati", "Acceso de empleados según las tiendas asignadas"], "订单与电商业务统一管理": ["Unified store and online order management", "Gestione unificata di ordini e commercio online", "Gestión unificada de pedidos en tienda y online"], "支持浏览器打印小票": ["Browser receipt printing", "Stampa scontrini dal browser", "Impresión de recibos desde el navegador"],
  "单机版 · 无需登录": ["Standalone · No sign-in", "Versione locale · Senza accesso", "Versión local · Sin iniciar sesión"], "连接睿鸥后台": ["Connect Ruiou Back Office", "Collega Ruiou Back Office", "Conectar Ruiou Back Office"], "进入已保存的睿鸥后台": ["Open saved Ruiou Back Office", "Apri Ruiou Back Office salvato", "Abrir Ruiou Back Office guardado"], "睿鸥科技": ["Ruiou Technology", "Ruiou Technology", "Ruiou Technology"], "版权所有": ["All rights reserved", "Tutti i diritti riservati", "Todos los derechos reservados"],
  "系统工具条": ["System toolbar", "Barra di sistema", "Barra de herramientas"], "工作台": ["Workspace", "Area di lavoro", "Área de trabajo"], "门店工作台": ["Store workspace", "Area di lavoro negozio", "Área de tienda"], "返回收银": ["Back to checkout", "Torna alla cassa", "Volver a caja"], "本机时间": ["Local time", "Ora locale", "Hora local"], "全屏": ["Full screen", "Schermo intero", "Pantalla completa"], "退出全屏": ["Exit full screen", "Esci da schermo intero", "Salir de pantalla completa"], "在线": ["Online", "Online", "Conectado"], "离线": ["Offline", "Offline", "Sin conexión"], "连接中": ["Connecting", "Connessione", "Conectando"], "单机版": ["Standalone", "Versione locale", "Versión local"], "本机单机模式": ["Local standalone mode", "Modalità locale", "Modo local independiente"], "后台在线": ["Back office online", "Back office online", "Servidor conectado"], "后台离线": ["Back office offline", "Back office offline", "Servidor sin conexión"], "正在连接": ["Connecting", "Connessione", "Conectando"],
  "选择门店": ["Select store", "Seleziona negozio", "Seleccionar tienda"], "切换门店": ["Switch store", "Cambia negozio", "Cambiar tienda"], "确认切换": ["Confirm switch", "Conferma cambio", "Confirmar cambio"], "门店": ["Store", "Negozio", "Tienda"], "全部门店": ["All stores", "Tutti i negozi", "Todas las tiendas"], "本机门店": ["Local store", "Negozio locale", "Tienda local"],
  "选择商品": ["Select products", "Seleziona prodotti", "Seleccionar productos"], "当前订单": ["Current order", "Ordine corrente", "Pedido actual"], "搜索商品": ["Search products", "Cerca prodotti", "Buscar productos"], "搜索商品名称 / 条码，或直接扫码": ["Search by product name or barcode, or scan", "Cerca per nome o codice a barre, oppure scansiona", "Busque por nombre o código de barras, o escanee"], "扫描商品条码或搜索": ["Scan barcode or search", "Scansiona codice o cerca", "Escanee código de barras o busque"], "全部商品": ["All products", "Tutti i prodotti", "Todos los productos"], "本机商品": ["Local products", "Prodotti locali", "Productos locales"], "查看更多": ["More", "Altro", "Más"], "收起分类": ["Collapse categories", "Riduci categorie", "Contraer categorías"], "商品分类": ["Product categories", "Categorie prodotti", "Categorías de productos"], "没有找到商品": ["No products found", "Nessun prodotto trovato", "No se encontraron productos"], "试试其他名称、条码或分类": ["Try another name, barcode, or category", "Prova un altro nome, codice o categoria", "Pruebe otro nombre, código o categoría"], "商品已售罄": ["Out of stock", "Esaurito", "Sin existencias"], "标准规格": ["Standard", "Standard", "Estándar"],
  "订单汇总": ["Order summary", "Riepilogo ordine", "Resumen del pedido"], "输入模式": ["Input mode", "Modalità inserimento", "Modo de entrada"], "商品数量键盘": ["Quantity keypad", "Tastierino quantità", "Teclado de cantidades"], "增加数量": ["Increase quantity", "Aumenta quantità", "Aumentar cantidad"], "减少数量": ["Decrease quantity", "Riduci quantità", "Reducir cantidad"], "退格": ["Backspace", "Cancella ultimo carattere", "Borrar carácter"], "移除所选商品": ["Remove selected product", "Rimuovi prodotto selezionato", "Quitar producto seleccionado"],
  "商品": ["Product", "Prodotto", "Producto"], "单价": ["Unit price", "Prezzo unitario", "Precio unitario"], "数量": ["Quantity", "Quantità", "Cantidad"], "小计": ["Subtotal", "Subtotale", "Subtotal"], "金额": ["Amount", "Importo", "Importe"], "清空": ["Clear", "Svuota", "Vaciar"], "清空订单": ["Clear order", "Svuota ordine", "Vaciar pedido"], "挂单": ["Hold", "Sospendi", "Aparcar"], "取单": ["Recall", "Riprendi", "Recuperar"], "改价": ["Change price", "Modifica prezzo", "Cambiar precio"], "结算": ["Checkout", "Pagamento", "Cobrar"], "会员结算": ["Member checkout", "Pagamento socio", "Cobro de socio"], "继续购物": ["Continue shopping", "Continua acquisti", "Seguir comprando"],
  "开始一笔新订单": ["Start a new order", "Inizia un nuovo ordine", "Iniciar un pedido nuevo"], "选择商品，或直接扫描商品条码": ["Select a product or scan its barcode", "Seleziona un prodotto o scansiona il codice", "Seleccione un producto o escanee su código"], "购物车为空": ["Cart is empty", "Carrello vuoto", "El carrito está vacío"], "移除商品": ["Remove product", "Rimuovi prodotto", "Quitar producto"], "是否移除此商品？": ["Remove this product?", "Rimuovere questo prodotto?", "¿Quitar este producto?"], "确认移除": ["Remove", "Rimuovi", "Quitar"], "取消": ["Cancel", "Annulla", "Cancelar"], "确认": ["Confirm", "Conferma", "Confirmar"], "关闭": ["Close", "Chiudi", "Cerrar"], "返回": ["Back", "Indietro", "Volver"], "完成": ["Done", "Fine", "Hecho"], "保存": ["Save", "Salva", "Guardar"], "修改": ["Edit", "Modifica", "Editar"], "删除": ["Delete", "Elimina", "Eliminar"], "重试": ["Retry", "Riprova", "Reintentar"], "刷新": ["Refresh", "Aggiorna", "Actualizar"], "查询": ["Search", "Cerca", "Buscar"], "重置": ["Reset", "Reimposta", "Restablecer"],
  "会员": ["Member", "Socio", "Socio"], "散客": ["Guest", "Cliente occasionale", "Cliente ocasional"], "选择会员": ["Select member", "Seleziona socio", "Seleccionar socio"], "查询会员": ["Find member", "Cerca socio", "Buscar socio"], "扫描会员码或输入手机号": ["Scan member code or enter phone", "Scansiona tessera o inserisci telefono", "Escanee código de socio o introduzca teléfono"], "请扫描会员码": ["Scan member code", "Scansiona tessera socio", "Escanear código de socio"], "会员管理": ["Members", "Soci", "Socios"], "会员新建": ["New member", "Nuovo socio", "Nuevo socio"], "新建会员": ["New member", "Nuovo socio", "Nuevo socio"], "创建会员": ["Create member", "Crea socio", "Crear socio"], "会员详情": ["Member details", "Dettagli socio", "Detalles del socio"], "会员资料": ["Member profile", "Profilo socio", "Perfil del socio"], "基本资料": ["Profile", "Profilo", "Datos personales"], "会员姓名": ["Member name", "Nome socio", "Nombre del socio"], "会员卡号": ["Card number", "Numero tessera", "Número de tarjeta"], "手机号": ["Phone", "Telefono", "Teléfono"], "等级": ["Tier", "Livello", "Nivel"], "积分": ["Points", "Punti", "Puntos"], "余额": ["Balance", "Saldo", "Saldo"], "可用积分": ["Available points", "Punti disponibili", "Puntos disponibles"], "账户余额": ["Account balance", "Saldo account", "Saldo de cuenta"], "可用优惠券": ["Available coupons", "Coupon disponibili", "Cupones disponibles"], "编辑资料": ["Edit profile", "Modifica profilo", "Editar perfil"], "保存资料": ["Save profile", "Salva profilo", "Guardar perfil"], "取消关联会员": ["Remove member", "Rimuovi socio", "Quitar socio"],
  "会员充值": ["Member top-up", "Ricarica socio", "Recarga de socio"], "发放优惠券": ["Issue coupon", "Assegna coupon", "Emitir cupón"], "优惠券": ["Coupons", "Coupon", "Cupones"], "优惠券管理": ["Coupons", "Coupon", "Cupones"], "优惠券发放": ["Issue coupons", "Assegna coupon", "Emitir cupones"], "优惠券名称 / 券码": ["Coupon name / code", "Nome / codice coupon", "Nombre / código de cupón"], "无门槛": ["No minimum", "Senza minimo", "Sin mínimo"], "有效期至": ["Valid until", "Valido fino al", "Válido hasta"], "使用积分抵扣": ["Use points", "Usa punti", "Usar puntos"], "暂无适用于本单的优惠券": ["No coupons available for this order", "Nessun coupon disponibile per questo ordine", "No hay cupones disponibles para este pedido"],
  "收款": ["Payment", "Pagamento", "Pago"], "现金": ["Cash", "Contanti", "Efectivo"], "微信": ["WeChat Pay", "WeChat Pay", "WeChat Pay"], "支付宝": ["Alipay", "Alipay", "Alipay"], "现金收款": ["Cash payment", "Pagamento in contanti", "Pago en efectivo"], "微信支付": ["WeChat Pay", "WeChat Pay", "WeChat Pay"], "支付方式": ["Payment method", "Metodo di pagamento", "Método de pago"], "待支付金额": ["Amount due", "Importo dovuto", "Importe pendiente"], "收款金额": ["Amount received", "Importo ricevuto", "Importe recibido"], "找零": ["Change", "Resto", "Cambio"], "确认收款": ["Confirm payment", "Conferma pagamento", "Confirmar pago"], "正在确认支付…": ["Confirming payment…", "Conferma pagamento…", "Confirmando pago…"], "核算中…": ["Calculating…", "Calcolo…", "Calculando…"], "去收款": ["Pay", "Paga", "Pagar"], "收款成功": ["Payment complete", "Pagamento completato", "Pago completado"], "打印小票": ["Print receipt", "Stampa ricevuta", "Imprimir recibo"], "完成，下一单": ["Done, next order", "Fine, prossimo ordine", "Hecho, siguiente pedido"],
  "订单管理": ["Orders", "Ordini", "Pedidos"], "订单核销": ["Order fulfillment", "Evasione ordini", "Entrega de pedidos"], "订单详情": ["Order details", "Dettagli ordine", "Detalles del pedido"], "订单号": ["Order number", "Numero ordine", "Número de pedido"], "订单 / 会员": ["Order / Member", "Ordine / Socio", "Pedido / Socio"], "下单时间": ["Order time", "Ora ordine", "Fecha del pedido"], "订单状态": ["Order status", "Stato ordine", "Estado del pedido"], "订单金额": ["Order amount", "Importo ordine", "Importe del pedido"], "全部": ["All", "Tutti", "Todos"], "待付款": ["Pending payment", "In attesa di pagamento", "Pendiente de pago"], "待履约": ["Pending fulfillment", "In attesa di evasione", "Pendiente de entrega"], "已完成": ["Completed", "Completato", "Completado"], "已关闭": ["Closed", "Chiuso", "Cerrado"], "待收款": ["Pending payment", "In attesa di pagamento", "Pendiente de pago"], "待提货": ["Ready for pickup", "Pronto al ritiro", "Listo para recoger"], "已核销": ["Fulfilled", "Evaso", "Entregado"], "已取消": ["Cancelled", "Annullato", "Cancelado"], "原订单": ["Original order", "Ordine originale", "Pedido original"], "查看原订单": ["View original order", "Vedi ordine originale", "Ver pedido original"], "返回单据列表": ["Back to orders", "Torna agli ordini", "Volver a pedidos"], "导出 Excel": ["Export Excel", "Esporta Excel", "Exportar Excel"], "请先勾选需要导出的记录": ["Select records to export", "Seleziona i record da esportare", "Seleccione registros para exportar"],
  "业绩看板": ["Performance dashboard", "Dashboard prestazioni", "Panel de resultados"], "经营概览": ["Overview", "Panoramica", "Resumen"], "开始日期": ["Start date", "Data iniziale", "Fecha inicial"], "结束日期": ["End date", "Data finale", "Fecha final"], "刷新数据": ["Refresh data", "Aggiorna dati", "Actualizar datos"], "期间实收": ["Net receipts", "Incassi del periodo", "Cobros netos"], "收款订单": ["Paid orders", "Ordini pagati", "Pedidos pagados"], "销售收款客单价": ["Average sale", "Scontrino medio", "Ticket medio"], "退款金额": ["Refunds", "Rimborsi", "Reembolsos"], "商品销售收款": ["Product sales", "Vendite prodotti", "Ventas de productos"], "会员充值实收": ["Member top-ups", "Ricariche soci", "Recargas de socios"], "扣退款后净收": ["Net after refunds", "Netto dopo rimborsi", "Neto tras reembolsos"], "分时收款": ["Receipts over time", "Incassi nel tempo", "Evolución de cobros"], "收款方式": ["Payment methods", "Metodi di pagamento", "Métodos de pago"], "暂无收款": ["No receipts", "Nessun incasso", "Sin cobros"], "本机现金销售": ["Local cash sales", "Vendite locali in contanti", "Ventas locales en efectivo"], "含会员充值": ["Includes member top-ups", "Include ricariche soci", "Incluye recargas de socios"], "已完成退款": ["Completed refunds", "Rimborsi completati", "Reembolsos completados"], "暂不可统计": ["Not available", "Non disponibile", "No disponible"],
  "管理功能导航": ["Management navigation", "Navigazione gestione", "Navegación de gestión"], "管理工作区": ["Management workspace", "Area gestione", "Área de gestión"], "已打开的页面": ["Open pages", "Pagine aperte", "Páginas abiertas"], "统计口径": ["Reporting basis", "Criterio di calcolo", "Criterios de cálculo"], "占期间实收": ["Share of receipts", "Quota degli incassi", "Proporción de cobros"], "时段峰值": ["Peak period", "Picco del periodo", "Período máximo"], "单": ["orders", "ordini", "pedidos"],
  "业务管理": ["Business", "Gestione attività", "Negocio"], "本机资料": ["Local data", "Dati locali", "Datos locales"], "本机设置": ["Local settings", "Impostazioni locali", "Ajustes locales"], "系统管理": ["System", "Sistema", "Sistema"], "商品管理": ["Products", "Prodotti", "Productos"], "商品新建": ["New product", "Nuovo prodotto", "Nuevo producto"], "新建商品": ["New product", "Nuovo prodotto", "Nuevo producto"], "用户管理": ["Users", "Utenti", "Usuarios"], "门店管理": ["Stores", "Negozi", "Tiendas"], "数据管理": ["Data", "Dati", "Datos"], "系统设置": ["System settings", "Impostazioni di sistema", "Ajustes del sistema"], "快捷键设置": ["Keyboard shortcuts", "Scorciatoie da tastiera", "Atajos de teclado"], "新增用户": ["New user", "Nuovo utente", "Nuevo usuario"], "新增门店": ["New store", "Nuovo negozio", "Nueva tienda"], "名称": ["Name", "Nome", "Nombre"], "状态": ["Status", "Stato", "Estado"], "操作": ["Actions", "Azioni", "Acciones"], "序号": ["No.", "N.", "N.º"], "类型": ["Type", "Tipo", "Tipo"], "描述": ["Description", "Descrizione", "Descripción"], "行号": ["Row", "Riga", "Fila"], "规格": ["Variant", "Variante", "Variante"], "条码": ["Barcode", "Codice a barre", "Código de barras"], "商品编码": ["Product code", "Codice prodotto", "Código de producto"], "售价": ["Price", "Prezzo", "Precio"], "售价（元）": ["Price (CNY)", "Prezzo (CNY)", "Precio (CNY)"], "备注": ["Notes", "Note", "Notas"],
  "维护本机资料。": ["Manage local data.", "Gestisci i dati locali.", "Gestione datos locales."], "分类": ["Category", "Categoria", "Categoría"], "全选当前页": ["Select current page", "Seleziona pagina corrente", "Seleccionar página actual"], "关闭商品管理": ["Close product management", "Chiudi gestione prodotti", "Cerrar gestión de productos"], "关闭会员管理": ["Close member management", "Chiudi gestione soci", "Cerrar gestión de socios"], "关闭订单管理": ["Close order management", "Chiudi gestione ordini", "Cerrar gestión de pedidos"],
  "未找到匹配记录": ["No matching records", "Nessun risultato", "No se encontraron registros"],
  "请调整搜索条件": ["Try adjusting your filters", "Prova a modificare i filtri", "Pruebe a ajustar los filtros"],
  "暂无退货记录": ["No returns yet", "Nessun reso", "Aún no hay devoluciones"],
  "上一页": ["Previous", "Precedente", "Anterior"], "下一页": ["Next", "Successivo", "Siguiente"], "每页条数": ["Rows per page", "Righe per pagina", "Filas por página"], "跳转页码": ["Go to page", "Vai alla pagina", "Ir a página"], "前往": ["Go to", "Vai a", "Ir a"], "页": ["Page", "Pagina", "Página"], "数据列表": ["Data table", "Tabella dati", "Tabla de datos"], "暂无匹配记录，请调整搜索条件。": ["No matching records. Adjust the filters.", "Nessun risultato. Modifica i filtri.", "Sin registros coincidentes. Ajuste los filtros."],
  "列表分页": ["Table pagination", "Paginazione tabella", "Paginación de tabla"], "跳转": ["Go", "Vai", "Ir"],
  "商品新建步骤": ["Product creation steps", "Passaggi creazione prodotto", "Pasos de creación de productos"], "选择方式": ["Choose method", "Scegli metodo", "Elegir método"], "选择分类": ["Choose category", "Scegli categoria", "Elegir categoría"], "填写数据": ["Enter data", "Inserisci dati", "Introducir datos"], "预览校验": ["Validate", "Convalida", "Validar"], "手动新建": ["Create manually", "Crea manualmente", "Crear manualmente"], "Excel 导入": ["Excel import", "Importa Excel", "Importar Excel"], "Excel 粘贴录入": ["Paste from Excel", "Incolla da Excel", "Pegar desde Excel"], "上一步": ["Previous", "Indietro", "Anterior"], "下一步": ["Next", "Avanti", "Siguiente"], "校验结果": ["Validation results", "Risultati convalida", "Resultados de validación"], "校验通过": ["Valid", "Valido", "Válido"], "商品可编辑网格": ["Editable product grid", "Griglia prodotti modificabile", "Cuadrícula editable de productos"], "导入数据": ["Import data", "Importa dati", "Importar datos"], "导出数据": ["Export data", "Esporta dati", "Exportar datos"],
  "分类搜索": ["Search categories", "Cerca categorie", "Buscar categorías"], "分类名称或完整路径": ["Category name or full path", "Nome categoria o percorso completo", "Nombre de categoría o ruta completa"], "新建分类": ["New category", "Nuova categoria", "Nueva categoría"], "完整路径": ["Full path", "Percorso completo", "Ruta completa"], "商品数": ["Products", "Prodotti", "Productos"], "末级": ["Leaf", "Finale", "Final"], "编辑": ["Edit", "Modifica", "Editar"], "分类名称": ["Category name", "Nome categoria", "Nombre de categoría"], "上级分类": ["Parent category", "Categoria superiore", "Categoría padre"], "无上级分类": ["No parent", "Nessuna categoria superiore", "Sin padre"], "维护本机多级分类；商品只能选择最末级分类。": ["Manage local category levels; products can use leaf categories only.", "Gestisci le categorie locali; i prodotti possono usare solo categorie finali.", "Gestione los niveles de categorías locales; los productos solo pueden usar categorías finales."],
  "订单上传": ["Order upload", "Caricamento ordini", "Subida de pedidos"], "上传离线订单": ["Upload offline orders", "Carica ordini offline", "Subir pedidos sin conexión"], "正在上传离线订单": ["Uploading offline orders", "Caricamento ordini offline", "Subiendo pedidos sin conexión"], "上传未完成": ["Upload incomplete", "Caricamento incompleto", "Subida incompleta"], "本次上传结束": ["Upload complete", "Caricamento completato", "Subida completada"], "暂无待上传订单": ["No orders to upload", "Nessun ordine da caricare", "No hay pedidos para subir"], "查看待上传订单": ["View pending orders", "Vedi ordini in attesa", "Ver pedidos pendientes"], "后台上传": ["Continue in background", "Continua in background", "Continuar en segundo plano"], "本机没有待上传订单。": ["No pending orders on this device.", "Nessun ordine in attesa su questo dispositivo.", "No hay pedidos pendientes en este dispositivo."],
  "系统设置已保存": ["Settings saved", "Impostazioni salvate", "Ajustes guardados"], "快捷键设置已保存": ["Shortcuts saved", "Scorciatoie salvate", "Atajos guardados"], "操作未完成，请重试": ["Operation not completed. Try again.", "Operazione non completata. Riprova.", "Operación no completada. Reintente."], "操作失败": ["Operation failed", "Operazione non riuscita", "Operación fallida"], "查询中…": ["Searching…", "Ricerca…", "Buscando…"], "保存中…": ["Saving…", "Salvataggio…", "Guardando…"], "更新中…": ["Updating…", "Aggiornamento…", "Actualizando…"], "识别中…": ["Scanning…", "Scansione…", "Escaneando…"], "文件读取失败": ["Could not read file", "Impossibile leggere il file", "No se pudo leer el archivo"], "查询已取消": ["Search cancelled", "Ricerca annullata", "Búsqueda cancelada"], "查询超时，请重试": ["Search timed out. Try again.", "Ricerca scaduta. Riprova.", "Tiempo de búsqueda agotado. Reintente."],
  "单机版 · 本机保存 · 支持现金收银与会员建档": ["Standalone · Saved locally · Cash checkout and member records", "Versione locale · Salvataggio locale · Cassa contanti e anagrafica soci", "Versión local · Guardado local · Caja en efectivo y socios"], "本机单机账本": ["Local ledger", "Registro locale", "Libro local"], "单机账本": ["Local ledger", "Registro locale", "Libro local"], "数据范围": ["Data scope", "Ambito dati", "Ámbito de datos"], "内容": ["Contents", "Contenuto", "Contenido"], "格式": ["Format", "Formato", "Formato"], "商品分类、商品、会员、历史现金订单": ["Categories, products, members, and cash orders", "Categorie, prodotti, soci e ordini in contanti", "Categorías, productos, socios y pedidos en efectivo"],
  "正在准备工作台": ["Preparing workspace", "Preparazione area di lavoro", "Preparando área de trabajo"], "门店资料与本机订单加载中": ["Loading store data and local orders", "Caricamento dati negozio e ordini locali", "Cargando datos de tienda y pedidos locales"], "正在切换用户": ["Switching user", "Cambio utente", "Cambiando usuario"], "现金实收": ["Cash received", "Contanti ricevuti", "Efectivo recibido"], "现金净收": ["Net cash", "Contanti netti", "Efectivo neto"],
  "积分流水": ["Points history", "Movimenti punti", "Historial de puntos"], "余额 / 充值流水": ["Balance / Top-up history", "Saldo / Ricariche", "Historial de saldo / recargas"], "订单记录": ["Orders", "Ordini", "Pedidos"], "支付记录": ["Payments", "Pagamenti", "Pagos"], "退货 / 售后": ["Returns / After-sales", "Resi / Post-vendita", "Devoluciones / Posventa"], "支付时间": ["Payment time", "Ora pagamento", "Fecha de pago"], "发生时间": ["Time", "Data e ora", "Hora"], "变动类型": ["Change type", "Tipo variazione", "Tipo de cambio"], "流水说明": ["Description", "Descrizione movimento", "Descripción"], "交易流水号": ["Transaction ID", "ID transazione", "Identificador de operación"], "分笔付款记录": ["Split payments", "Pagamenti frazionati", "Pagos divididos"],
  "充值金额": ["Top-up amount", "Importo ricarica", "Importe de recarga"], "赠送金额": ["Bonus amount", "Importo bonus", "Bonificación"], "钱包到账": ["Wallet credited", "Accreditato sul portafoglio", "Abono al monedero"], "钱包余额": ["Wallet balance", "Saldo portafoglio", "Saldo del monedero"], "待入账": ["Pending credit", "In attesa di accredito", "Pendiente de abono"], "实付": ["Paid", "Pagato", "Pagado"], "商品小计": ["Product subtotal", "Subtotale prodotti", "Subtotal de productos"],
  "订单备注": ["Order notes", "Note ordine", "Notas del pedido"], "填写本次交易备注": ["Add a note for this transaction", "Aggiungi una nota alla transazione", "Añada una nota para esta operación"], "支付待确认": ["Payment pending confirmation", "Pagamento da confermare", "Pago pendiente de confirmación"], "剩余应收": ["Balance due", "Saldo dovuto", "Saldo pendiente"], "已付金额": ["Amount paid", "Importo pagato", "Importe pagado"], "交易类型 / 核销": ["Transaction / Fulfillment", "Transazione / Evasione", "Operación / Entrega"], "状态 / 原因": ["Status / Reason", "Stato / Motivo", "Estado / Motivo"],
  "退单": ["Return", "Reso", "Devolución"], "退单原因": ["Return reason", "Motivo del reso", "Motivo de devolución"], "扫描小票二维码": ["Scan receipt QR code", "Scansiona QR dello scontrino", "Escanear QR del recibo"], "关联原订单": ["Original order", "Ordine originale", "Pedido original"], "原订单号 / 商品 / 退货原因": ["Original order / Product / Reason", "Ordine originale / Prodotto / Motivo", "Pedido original / Producto / Motivo"],
  "地址": ["Address", "Indirizzo", "Dirección"], "到店自提": ["Store pickup", "Ritiro in negozio", "Recogida en tienda"], "送货上门": ["Delivery", "Consegna", "Entrega"], "提货二维码": ["Pickup QR code", "QR di ritiro", "QR de recogida"], "请凭此码提货": ["Present this code for pickup", "Mostra questo codice per il ritiro", "Presente este código para recoger"], "核对并核销": ["Verify and fulfill", "Verifica ed evadi", "Verificar y entregar"],
  "商品名称": ["Product name", "Nome prodotto", "Nombre del producto"], "商品描述": ["Product description", "Descrizione prodotto", "Descripción del producto"], "商品导入": ["Product import", "Importazione prodotti", "Importar productos"], "上传 .xlsx 文件": ["Upload .xlsx file", "Carica file .xlsx", "Subir archivo .xlsx"], "粘贴 Excel 数据": ["Paste Excel data", "Incolla dati Excel", "Pegar datos de Excel"], "可扫描商品条码": ["Scannable product barcode", "Codice prodotto scansionabile", "Código de barras escaneable"], "例如：500g / 袋": ["Example: 500g / bag", "Esempio: 500g / confezione", "Ejemplo: 500 g / bolsa"],
  "选择商品录入方式": ["Choose how to add products", "Scegli come inserire i prodotti", "Elija cómo añadir productos"], "选择分类，填写单件商品资料": ["Choose a category and enter one product", "Scegli una categoria e inserisci un prodotto", "Elija una categoría e introduzca un producto"], "上传模板文件，批量预览校验": ["Upload a template for batch validation", "Carica un modello per la convalida in blocco", "Suba una plantilla para validar por lotes"], "Excel 粘贴": ["Paste from Excel", "Incolla da Excel", "Pegar desde Excel"], "复制表格内容，直接预览校验": ["Paste spreadsheet cells and validate", "Incolla le celle del foglio e convalida", "Pegue celdas de la hoja y valide"], "创建一件单规格商品，先选择一个末级商品分类。": ["Create one single-variant product. Start with a leaf category.", "Crea un prodotto a variante singola. Inizia da una categoria finale.", "Cree un producto de una sola variante. Empiece por una categoría final."],
  "下载导入模板": ["Download import template", "Scarica modello di importazione", "Descargar plantilla de importación"], "上传 Excel": ["Upload Excel", "Carica Excel", "Subir Excel"], "选择商品分类": ["Choose product category", "Scegli categoria prodotto", "Elegir categoría de producto"], "填写商品资料": ["Enter product details", "Inserisci dettagli prodotto", "Introducir detalles del producto"], "分类：": ["Category:", "Categoria:", "Categoría:"], "商品图片": ["Product image", "Immagine prodotto", "Imagen del producto"], "待上传商品图片": ["Product image to upload", "Immagine prodotto da caricare", "Imagen del producto para subir"], "移除图片": ["Remove image", "Rimuovi immagine", "Quitar imagen"], "重新校验": ["Validate again", "Convalida di nuovo", "Volver a validar"], "数据已修改，请重新校验": ["Data changed. Validate again.", "Dati modificati. Convalida di nuovo.", "Los datos cambiaron. Vuelva a validar."], "确认创建": ["Create", "Crea", "Crear"], "下一步：校验": ["Next: Validate", "Avanti: Convalida", "Siguiente: Validar"], "确认原提交结果": ["Confirm previous submission", "Conferma invio precedente", "Confirmar envío anterior"],
  "当前离线，请联网后维护商品。": ["You are offline. Connect to manage products.", "Sei offline. Connettiti per gestire i prodotti.", "Sin conexión. Conéctese para gestionar productos."], "图片最大 5MB；商品创建后上架，采用无库存下单。": ["Images up to 5 MB. Products are published after creation.", "Immagini fino a 5 MB. I prodotti vengono pubblicati dopo la creazione.", "Imágenes de hasta 5 MB. Los productos se publican tras crearlos."], "核对资料后确认创建；如需修改，请返回上一步。": ["Review the details, then create. Go back to edit.", "Verifica i dati, poi crea. Torna indietro per modificarli.", "Revise los datos y cree el producto. Vuelva atrás para editar."], "可直接修改表格；修改后需重新校验，全部通过后才能创建。": ["Edit cells directly, then validate again before creating.", "Modifica direttamente le celle, poi convalida prima di creare.", "Edite las celdas directamente y vuelva a validar antes de crear."],
  "普通会员": ["Standard member", "Socio standard", "Socio estándar"], "本机会员": ["Local member", "Socio locale", "Socio local"], "自动生成会员卡号。": ["A card number is generated automatically.", "Il numero tessera viene generato automaticamente.", "Se genera un número de tarjeta automáticamente."], "未填写手机号": ["No phone number", "Telefono non indicato", "Sin número de teléfono"], "未留电话": ["No phone", "Telefono non indicato", "Sin teléfono"],
  "关闭提示": ["Close message", "Chiudi messaggio", "Cerrar mensaje"], "关闭确认": ["Close confirmation", "Chiudi conferma", "Cerrar confirmación"], "关闭结算": ["Close checkout", "Chiudi pagamento", "Cerrar cobro"], "关闭编辑": ["Close editor", "Chiudi modifica", "Cerrar editor"], "关闭面板": ["Close panel", "Chiudi pannello", "Cerrar panel"], "关闭系统设置": ["Close settings", "Chiudi impostazioni", "Cerrar ajustes"], "关闭上传窗口": ["Close upload", "Chiudi caricamento", "Cerrar subida"], "关闭门店切换": ["Close store switch", "Chiudi cambio negozio", "Cerrar cambio de tienda"],
  "保存成功": ["Saved", "Salvato", "Guardado"], "确认删除": ["Confirm delete", "Conferma eliminazione", "Confirmar eliminación"], "确认取回": ["Confirm recall", "Conferma ripresa", "Confirmar recuperación"], "删除挂单": ["Delete held order", "Elimina ordine sospeso", "Eliminar pedido aparcado"], "取回挂单": ["Recall held order", "Riprendi ordine sospeso", "Recuperar pedido aparcado"], "未选择会员": ["No member selected", "Nessun socio selezionato", "Ningún socio seleccionado"], "找不到会员": ["Member not found", "Socio non trovato", "Socio no encontrado"], "会员不存在": ["Member does not exist", "Socio inesistente", "El socio no existe"],
  "无法读取挂单记录": ["Could not load held orders", "Impossibile leggere gli ordini sospesi", "No se pudieron cargar los pedidos aparcados"], "无法恢复上次购物车": ["Could not restore the previous cart", "Impossibile ripristinare il carrello precedente", "No se pudo restaurar el carrito anterior"], "无法读取离线订单记录": ["Could not load offline orders", "Impossibile leggere gli ordini offline", "No se pudieron cargar los pedidos sin conexión"], "购物车自动保存失败，请勿关闭页面": ["Cart auto-save failed. Keep this page open.", "Salvataggio automatico non riuscito. Non chiudere la pagina.", "Error de guardado automático del carrito. Mantenga esta página abierta."],
  "连接失败，请检查网络；已提交的操作请先核实结果": ["Connection failed. Check the network and verify any submitted operation.", "Connessione non riuscita. Controlla la rete e verifica le operazioni inviate.", "Error de conexión. Compruebe la red y verifique las operaciones enviadas."], "后台响应异常，请稍后重试；已提交的操作请先核实结果": ["Invalid server response. Try again later and verify submitted operations.", "Risposta del server non valida. Riprova e verifica le operazioni inviate.", "Respuesta del servidor no válida. Reintente más tarde y verifique las operaciones enviadas."], "后台服务异常，请稍后重试；已提交的操作请先核实结果": ["Server unavailable. Try again later and verify submitted operations.", "Server non disponibile. Riprova e verifica le operazioni inviate.", "Servidor no disponible. Reintente más tarde y verifique las operaciones enviadas."],
  "请等待扫码完成后结算": ["Wait for scanning to finish before checkout", "Attendi la fine della scansione prima del pagamento", "Espere a que termine el escaneo antes de cobrar"], "请等待扫码完成后挂单": ["Wait for scanning to finish before holding the order", "Attendi la fine della scansione prima di sospendere l'ordine", "Espere a que termine el escaneo antes de aparcar el pedido"], "请等待扫码完成后清空": ["Wait for scanning to finish before clearing", "Attendi la fine della scansione prima di svuotare", "Espere a que termine el escaneo antes de vaciar"], "扫码处理中，请稍候再结算": ["Scanning in progress. Wait before checkout.", "Scansione in corso. Attendi prima del pagamento.", "Escaneo en curso. Espere antes de cobrar."],
  "商品库存不足，未加购": ["Insufficient stock. Product not added.", "Scorte insufficienti. Prodotto non aggiunto.", "Existencias insuficientes. Producto no añadido."], "已达到当前库存数量": ["Current stock limit reached", "Raggiunto il limite di scorta", "Límite de existencias alcanzado"], "条码对应多个商品，请手动选择": ["Multiple products use this barcode. Select one manually.", "Più prodotti usano questo codice. Selezionane uno manualmente.", "Varios productos usan este código. Seleccione uno manualmente."], "找到相关商品，请核对并手动选择": ["Related products found. Verify and select one.", "Trovati prodotti correlati. Verifica e seleziona.", "Productos relacionados encontrados. Verifique y seleccione uno."],
  "请输入改价原因，最多 200 字": ["Enter a price-change reason, up to 200 characters", "Inserisci il motivo della modifica, massimo 200 caratteri", "Introduzca el motivo del cambio de precio, hasta 200 caracteres"], "请填写改价原因": ["Enter a price-change reason", "Inserisci il motivo della modifica", "Indique el motivo del cambio de precio"], "结算核算失败，请稍后重试": ["Checkout calculation failed. Try again.", "Calcolo del pagamento non riuscito. Riprova.", "Error al calcular el cobro. Reintente."], "购物车商品已变化，请重新核对": ["Cart items changed. Review them again.", "Gli articoli nel carrello sono cambiati. Verificali di nuovo.", "Los productos del carrito cambiaron. Revise de nuevo."],
};

Object.assign(phrases, {
  "产品介绍": [
    "Products",
    "Prodotti",
    "Productos"
  ],
  "选择适合门店的版本": [
    "Choose your edition",
    "Scegli la tua versione",
    "Elija su versión"
  ],
  "本机独立使用，或连接云端统一管理。": [
    "Work locally or connect to the cloud for central management.",
    "Lavora in locale o collega il cloud per una gestione centralizzata.",
    "Trabaje localmente o conecte la nube para una gestión centralizada."
  ],
  "商品与订单保存在本机，支持现金收款和本地数据备份。": [
    "Products and orders are saved locally, with cash payments and backups.",
    "Prodotti e ordini salvati in locale, con pagamenti in contanti e backup.",
    "Productos y pedidos guardados localmente, con cobros en efectivo y copias de seguridad."
  ],
  "无需登录，即可独立使用。": [
    "Use independently without signing in.",
    "Utilizzabile senza accesso.",
    "Úselo sin iniciar sesión."
  ],
  "保留本机数据管理，可开通微信、支付宝扫码收款。": [
    "Keep local data management and enable WeChat and Alipay payments.",
    "Gestisci i dati in locale e attiva i pagamenti WeChat e Alipay.",
    "Gestione los datos localmente y active pagos con WeChat y Alipay."
  ],
  "联系升级购买；开通商户支付并配置参数后使用，扫码收款需联网。": [
    "Contact us to upgrade. Activate and configure merchant payments; scanning requires internet.",
    "Contattaci per l’upgrade. Attiva e configura i pagamenti commerciante; la scansione richiede internet.",
    "Contáctenos para actualizar. Active y configure los pagos del comercio; el escaneo requiere internet."
  ],
  "云端版本": [
    "Cloud edition",
    "Versione cloud",
    "Versión en la nube"
  ],
  "连接云端 Odoo，统一管理店铺、店员、商品、会员与订单。": [
    "Connect to Odoo to manage stores, staff, products, members and orders centrally.",
    "Collega Odoo per gestire negozi, personale, prodotti, soci e ordini centralmente.",
    "Conecte Odoo para gestionar tiendas, personal, productos, socios y pedidos de forma centralizada."
  ],
  "在 POS 登录云端账号，按门店权限使用。": [
    "Sign in with your cloud account and store permissions.",
    "Accedi con il tuo account cloud e i permessi del negozio.",
    "Inicie sesión con su cuenta en la nube y los permisos de tienda."
  ],
  "账户登录": [
    "ACCOUNT SIGN IN",
    "ACCESSO ACCOUNT",
    "ACCESO A LA CUENTA"
  ],
  "支付设置": [
    "Payment settings",
    "Impostazioni pagamenti",
    "Ajustes de pago"
  ],
  "员工管理": [
    "Staff",
    "Personale",
    "Personal"
  ],
  "退货": [
    "Return",
    "Reso",
    "Devolución"
  ],
  "设置向导": [
    "Setup guide",
    "Configurazione guidata",
    "Asistente de configuración"
  ],
  "单机版设置步骤": [
    "Local setup steps",
    "Passaggi di configurazione locale",
    "Pasos de configuración local"
  ],
  "选择数据": [
    "Choose data",
    "Scegli dati",
    "Elegir datos"
  ],
  "准备商品": [
    "Prepare products",
    "Prepara prodotti",
    "Preparar productos"
  ],
  "完成设置": [
    "Finish setup",
    "Completa configurazione",
    "Finalizar configuración"
  ],
  "确认收银币种": [
    "Confirm checkout currency",
    "Conferma la valuta",
    "Confirme la moneda de cobro"
  ],
  "先设置收银币种，再准备商品数据。": [
    "Set your currency, then prepare product data.",
    "Imposta la valuta, poi prepara i dati dei prodotti.",
    "Configure la moneda y después prepare los productos."
  ],
  "已有商品或订单，保留原币种。": [
    "Existing products or orders: keep the original currency.",
    "Prodotti o ordini esistenti: mantieni la valuta originale.",
    "Hay productos o pedidos: conserve la moneda original."
  ],
  "已有商品或订单，请保留原币种": [
    "Keep the original currency for existing products or orders.",
    "Mantieni la valuta originale per i prodotti o ordini esistenti.",
    "Conserve la moneda original de los productos o pedidos existentes."
  ],
  "关联云端": [
    "Connect to cloud",
    "Connetti al cloud",
    "Conectar a la nube"
  ],
  "先确认你的数据来源": [
    "Choose your data source",
    "Scegli l’origine dei dati",
    "Elija el origen de los datos"
  ],
  "使用已有资料，或为这台设备准备商品数据。": [
    "Use existing data or prepare products for this device.",
    "Usa dati esistenti o prepara i prodotti per questo dispositivo.",
    "Use datos existentes o prepare productos para este dispositivo."
  ],
  "使用本机数据": [
    "Use local data",
    "Usa dati locali",
    "Usar datos locales"
  ],
  "导入商品": [
    "Import products",
    "Importa prodotti",
    "Importar productos"
  ],
  "Excel 导入、粘贴或手动录入": [
    "Import Excel, paste or enter manually",
    "Importa Excel, incolla o inserisci manualmente",
    "Importe Excel, pegue o introduzca manualmente"
  ],
  "读取备份资料和币种": [
    "Read backup data and currency",
    "Leggi dati e valuta del backup",
    "Leer datos y moneda de la copia"
  ],
  "准备商品数据": [
    "Prepare product data",
    "Prepara i dati dei prodotti",
    "Preparar datos de productos"
  ],
  "演示数据包含商品、会员和示例订单，会计入本机看板。": [
    "Demo products, members and orders will be included in the local dashboard.",
    "Prodotti, soci e ordini dimostrativi saranno inclusi nel dashboard locale.",
    "Los productos, socios y pedidos de muestra se incluirán en el panel local."
  ],
  "新增商品": [
    "New products",
    "Nuovi prodotti",
    "Productos nuevos"
  ],
  "相同记录不会重复导入": [
    "Identical records are skipped",
    "I record identici vengono ignorati",
    "Se omiten los registros idénticos"
  ],
  "已有数据不会重复创建。": [
    "Existing data will not be duplicated.",
    "I dati esistenti non verranno duplicati.",
    "Los datos existentes no se duplicarán."
  ],
  "一切就绪": [
    "All ready",
    "Tutto pronto",
    "Todo listo"
  ],
  "正在处理，请稍候…": [
    "Processing, please wait…",
    "Elaborazione in corso…",
    "Procesando, espere…"
  ],
  "开始使用": [
    "Get started",
    "Inizia",
    "Comenzar"
  ],
  "确认加载数据": [
    "Load data",
    "Carica dati",
    "Cargar datos"
  ],
  "预计记录": [
    "Expected records",
    "Record previsti",
    "Registros previstos"
  ],
  "未完成": [
    "Incomplete",
    "Non completato",
    "Sin completar"
  ],
  "等待处理": [
    "Waiting",
    "In attesa",
    "En espera"
  ],
  "准备就绪": [
    "Ready",
    "Pronto",
    "Listo"
  ],
  "加载未完成，请重试": [
    "Loading incomplete. Try again.",
    "Caricamento incompleto. Riprova.",
    "Carga incompleta. Reintente."
  ],
  "正在完成数据准备…": [
    "Preparing data…",
    "Preparazione dei dati…",
    "Preparando datos…"
  ],
  "重复记录自动跳过，完成后显示本次新增数量。": [
    "Duplicates are skipped. New record counts appear when complete.",
    "I duplicati vengono ignorati. Al termine appare il numero di nuovi record.",
    "Se omiten duplicados. Al finalizar se muestra el número de registros nuevos."
  ],
  "备份必须包含有效商品": [
    "The backup must contain valid products.",
    "Il backup deve contenere prodotti validi.",
    "La copia debe contener productos válidos."
  ],
  "请先准备至少一件有效商品，再开始收银": [
    "Add at least one valid product before checkout.",
    "Aggiungi almeno un prodotto valido prima di iniziare.",
    "Añada al menos un producto válido antes de cobrar."
  ],
  "请选择数据来源": [
    "Choose a data source.",
    "Scegli l’origine dei dati.",
    "Elija un origen de datos."
  ],
  "请选择备份文件": [
    "Choose a backup file.",
    "Scegli un file di backup.",
    "Elija un archivo de copia de seguridad."
  ],
  "请返回第二步重新选择备份文件": [
    "Return to step 2 and select the backup again.",
    "Torna al passaggio 2 e seleziona di nuovo il backup.",
    "Vuelva al paso 2 y seleccione de nuevo la copia."
  ],
  "备份币种与所选币种不一致，请返回确认": [
    "The backup currency differs. Go back to confirm.",
    "La valuta del backup è diversa. Torna indietro per confermare.",
    "La moneda de la copia es diferente. Vuelva atrás para confirmar."
  ],
  "备份币种为 {0}，请返回第一步确认币种后再导入": [
    "Backup currency is {0}. Confirm it in step 1 before importing.",
    "La valuta del backup è {0}. Confermala al passaggio 1 prima di importare.",
    "La moneda de la copia es {0}. Confírmela en el paso 1 antes de importar."
  ],
  "管理会员资料与资产": [
    "Manage members and balances",
    "Gestisci soci e saldi",
    "Gestionar socios y saldos"
  ],
  "维护会员资料，查看会员等级、积分、余额与消费记录。": [
    "Manage member details, tiers, points, balances and purchases.",
    "Gestisci dati dei soci, livelli, punti, saldi e acquisti.",
    "Gestione datos de socios, niveles, puntos, saldos y compras."
  ],
  "设置会员等级与积分规则": [
    "Set member tiers and points",
    "Configura livelli e punti",
    "Configurar niveles y puntos"
  ],
  "配置会员等级、消费积分和积分抵扣规则。": [
    "Configure tiers, purchase points and redemption rules.",
    "Configura livelli, punti sugli acquisti e regole di utilizzo.",
    "Configure niveles, puntos por compras y reglas de canje."
  ],
  "开通微信与支付宝扫码收款": [
    "Enable WeChat and Alipay payments",
    "Attiva pagamenti WeChat e Alipay",
    "Activar pagos WeChat y Alipay"
  ],
  "配置商户支付参数，使用微信、支付宝扫码收款。扫码收款需要联网。": [
    "Configure merchant payments for WeChat and Alipay. Internet is required.",
    "Configura i pagamenti commerciante per WeChat e Alipay. È necessaria la connessione internet.",
    "Configure los pagos del comercio para WeChat y Alipay. Se requiere internet."
  ],
  "连接云端管理业务": [
    "Manage your business in the cloud",
    "Gestisci l’attività nel cloud",
    "Gestionar el negocio en la nube"
  ],
  "配置云端地址，在 POS 登录云端账号，按门店权限使用业务功能。": [
    "Set your cloud address and sign in with your store permissions.",
    "Configura l’indirizzo cloud e accedi con i permessi del negozio.",
    "Configure la dirección de la nube e inicie sesión con sus permisos de tienda."
  ],
  "未开通功能预览": [
    "Feature preview",
    "Anteprima funzione",
    "Vista previa de función"
  ],
  "当前版本尚未开通，升级后可使用。": [
    "Upgrade to unlock this feature.",
    "Esegui l’upgrade per sbloccare questa funzione.",
    "Actualice para desbloquear esta función."
  ],
  "联系升级购买": [
    "Contact us to upgrade",
    "Contattaci per l’upgrade",
    "Contactar para actualizar"
  ],
  "单机-{0}": [
    "Local-{0}",
    "Locale-{0}",
    "Local-{0}"
  ],
  "演示会员 {0}": [
    "Demo Customer {0}",
    "Cliente demo {0}",
    "Cliente de muestra {0}"
  ],
  "调整列宽：{0}": [
    "Resize column: {0}",
    "Ridimensiona colonna: {0}",
    "Cambiar ancho de columna: {0}"
  ],
  "应用 ID（AppID）": [
    "App ID (AppID)",
    "ID applicazione (AppID)",
    "ID de aplicación (AppID)"
  ],
  "商户号（MchID）": [
    "Merchant ID (MchID)",
    "ID commerciante (MchID)",
    "ID de comercio (MchID)"
  ],
  "API 密钥": [
    "API key",
    "Chiave API",
    "Clave API"
  ],
  "商户证书": [
    "Merchant certificate",
    "Certificato commerciante",
    "Certificado del comercio"
  ],
  "商户私钥": [
    "Merchant private key",
    "Chiave privata commerciante",
    "Clave privada del comercio"
  ],
  "商户账号": [
    "Merchant account",
    "Account commerciante",
    "Cuenta del comercio"
  ],
  "应用私钥": [
    "App private key",
    "Chiave privata applicazione",
    "Clave privada de aplicación"
  ],
  "支付宝公钥": [
    "Alipay public key",
    "Chiave pubblica Alipay",
    "Clave pública de Alipay"
  ],
  "单机版暂不开放微信、支付宝扫码收款。请联系睿鸥科技升级购买后开通。": [
    "Contact Ruiou Technology to upgrade and enable WeChat and Alipay payments.",
    "Contatta Ruiou Technology per l’upgrade e per attivare WeChat e Alipay.",
    "Contacte con Ruiou Technology para actualizar y activar WeChat y Alipay."
  ],
  "现金收款可正常使用。": [
    "Cash payments are available.",
    "I pagamenti in contanti sono disponibili.",
    "Los cobros en efectivo están disponibles."
  ],
  "启用扫码收款": [
    "Enable scan payments",
    "Attiva pagamenti tramite scansione",
    "Activar pagos por escaneo"
  ],
  "升级开通后配置": [
    "Configure after upgrade",
    "Configura dopo l’upgrade",
    "Configurar tras actualizar"
  ],
  "当前版本不可填写或保存支付参数。": [
    "Payment parameters cannot be edited in this edition.",
    "I parametri di pagamento non sono modificabili in questa versione.",
    "Los parámetros de pago no se pueden editar en esta versión."
  ],
  "请先完成门店、店员和商品设置": [
    "Complete store, staff and product setup first.",
    "Completa prima la configurazione di negozio, personale e prodotti.",
    "Complete primero la configuración de tienda, personal y productos."
  ]
});

Object.assign(phrases, {
  "扫描原小票条码 / 输入订单号": [
    "Scan original receipt / Enter order number",
    "Scansiona lo scontrino / Inserisci il numero ordine",
    "Escanee el recibo / Introduzca el número de pedido"
  ],
  "商品条码": [
    "Product barcode",
    "Codice a barre prodotto",
    "Código de barras del producto"
  ],
  "购买数量": [
    "Purchased quantity",
    "Quantità acquistata",
    "Cantidad comprada"
  ],
  "此条码无法生成一维码": [
    "Cannot generate this barcode",
    "Impossibile generare questo codice a barre",
    "No se puede generar este código de barras"
  ],
  "暂无条码": [
    "No barcode",
    "Nessun codice a barre",
    "Sin código de barras"
  ],
  "确认退款": [
    "Confirm refund",
    "Conferma rimborso",
    "Confirmar reembolso"
  ],
  "翻译": [
    "Translations",
    "Traduzioni",
    "Traducciones"
  ],
  "请先选择或创建门店": [
    "Select or create a store first.",
    "Seleziona o crea prima un negozio.",
    "Seleccione o cree primero una tienda."
  ],
  "请先为此门店设置有效店员": [
    "Assign valid staff to this store first.",
    "Assegna prima il personale a questo negozio.",
    "Asigne primero personal válido a esta tienda."
  ],
  "请先准备可销售商品": [
    "Add available products first.",
    "Aggiungi prima prodotti vendibili.",
    "Añada primero productos disponibles."
  ],
  "联机版设置步骤": [
    "Cloud setup steps",
    "Passaggi di configurazione cloud",
    "Pasos de configuración en la nube"
  ],
  "确认店铺": [
    "Confirm store",
    "Conferma negozio",
    "Confirmar tienda"
  ],
  "店员设置": [
    "Staff setup",
    "Configura personale",
    "Configurar personal"
  ],
  "商品数据": [
    "Product data",
    "Dati prodotti",
    "Datos de productos"
  ],
  "确认云端店铺": [
    "Confirm cloud store",
    "Conferma negozio cloud",
    "Confirmar tienda en la nube"
  ],
  "已登录": [
    "Signed in",
    "Accesso effettuato",
    "Sesión iniciada"
  ],
  "选择已有店铺，或创建一家新店。": [
    "Select an existing store or create a new one.",
    "Seleziona un negozio esistente o creane uno nuovo.",
    "Seleccione una tienda existente o cree una nueva."
  ],
  "店铺": [
    "Store",
    "Negozio",
    "Tienda"
  ],
  "请选择店铺": [
    "Select a store",
    "Seleziona un negozio",
    "Seleccione una tienda"
  ],
  "创建或管理店铺": [
    "Create or manage stores",
    "Crea o gestisci negozi",
    "Crear o gestionar tiendas"
  ],
  "需要新增或修改店铺，请联系管理员。": [
    "Contact an administrator to add or edit stores.",
    "Contatta un amministratore per aggiungere o modificare negozi.",
    "Contacte al administrador para añadir o editar tiendas."
  ],
  "确认店员与权限": [
    "Confirm staff and permissions",
    "Conferma personale e permessi",
    "Confirmar personal y permisos"
  ],
  "此门店尚无有效店员。": [
    "This store has no active staff.",
    "Questo negozio non ha personale attivo.",
    "Esta tienda no tiene personal activo."
  ],
  "设置店员": [
    "Set up staff",
    "Configura personale",
    "Configurar personal"
  ],
  "已有店员可直接确认；需要调整账号或权限，请联系管理员。": [
    "Confirm existing staff; contact an administrator to change accounts or permissions.",
    "Conferma il personale esistente; contatta un amministratore per modificare account o permessi.",
    "Confirme el personal existente; contacte al administrador para cambiar cuentas o permisos."
  ],
  "确认商品数据": [
    "Confirm product data",
    "Conferma dati prodotti",
    "Confirmar datos de productos"
  ],
  "先创建商品分类": [
    "Create product categories first",
    "Crea prima le categorie prodotto",
    "Cree primero categorías de productos"
  ],
  "创建分类": [
    "Create category",
    "Crea categoria",
    "Crear categoría"
  ],
  "请管理员先准备商品分类，然后刷新检查。": [
    "Ask an administrator to create categories, then refresh.",
    "Chiedi a un amministratore di creare le categorie, poi aggiorna.",
    "Pida al administrador que cree categorías y actualice."
  ],
  "导入或创建商品": [
    "Import or create products",
    "Importa o crea prodotti",
    "Importar o crear productos"
  ],
  "请联系店长或管理员准备商品，然后刷新检查。": [
    "Ask the store manager or administrator to add products, then refresh.",
    "Chiedi al responsabile o amministratore di aggiungere prodotti, poi aggiorna.",
    "Pida al encargado o administrador que añada productos y actualice."
  ],
  "设置完成": [
    "Setup complete",
    "Configurazione completata",
    "Configuración completada"
  ],
  "开始使用前会再次检查云端资料。": [
    "Cloud data will be checked again before you start.",
    "I dati cloud verranno verificati di nuovo prima di iniziare.",
    "Los datos de la nube se verificarán de nuevo antes de comenzar."
  ],
  "正在检查云端数据…": [
    "Checking cloud data…",
    "Verifica dei dati cloud…",
    "Verificando datos de la nube…"
  ],
  "切换账号": [
    "Switch account",
    "Cambia account",
    "Cambiar cuenta"
  ],
  "刷新检查": [
    "Refresh and check",
    "Aggiorna e verifica",
    "Actualizar y verificar"
  ],
  "确认并继续": [
    "Confirm and continue",
    "Conferma e continua",
    "Confirmar y continuar"
  ],
  "保存云端地址后，使用云端账号登录。": [
    "Save the cloud address, then sign in with your cloud account.",
    "Salva l’indirizzo cloud, poi accedi con il tuo account cloud.",
    "Guarde la dirección de la nube e inicie sesión con su cuenta."
  ],
  "返回币种设置": [
    "Back to currency settings",
    "Torna alle impostazioni valuta",
    "Volver a ajustes de moneda"
  ],
  "保存并继续": [
    "Save and continue",
    "Salva e continua",
    "Guardar y continuar"
  ],
  "登录后继续配置云端店铺、店员和商品。本机数据保留。": [
    "After sign-in, configure stores, staff and products. Local data is retained.",
    "Dopo l’accesso, configura negozi, personale e prodotti. I dati locali vengono conservati.",
    "Tras iniciar sesión, configure tiendas, personal y productos. Los datos locales se conservan."
  ],
  "修改地址": [
    "Edit address",
    "Modifica indirizzo",
    "Editar dirección"
  ],
  "登录并继续设置": [
    "Sign in and continue setup",
    "Accedi e continua la configurazione",
    "Iniciar sesión y continuar"
  ]
});

Object.assign(phrases, {
 "已退款": ["Refunded", "Rimborsato", "Reembolsado"],
 "云端已有 {0} 件可销售商品": ["{0} products available in the cloud", "{0} prodotti disponibili nel cloud", "{0} productos disponibles en la nube"]
});
Object.assign(phrases, {
 "此订单号无法生成条形码": ["No barcode is available for this order number", "Nessun codice a barre disponibile per questo numero ordine", "No hay código de barras para este número de pedido"],
 "订单条形码：{0}": ["Order barcode: {0}", "Codice a barre ordine: {0}", "Código de barras del pedido: {0}"]
});
Object.assign(phrases, {
  "无法加载商品翻译": [
    "Unable to load product translations",
    "Impossibile caricare le traduzioni dei prodotti",
    "No se pueden cargar las traducciones de productos",
    "Não foi possível carregar as traduções dos produtos"
  ],
  "商品数：{0}": [
    "Products: {0}",
    "Prodotti: {0}",
    "Productos: {0}",
    "Produtos: {0}"
  ],
  "返回设置向导": [
    "Back to setup",
    "Torna alla configurazione",
    "Volver a la configuración",
    "Voltar à configuração"
  ],
  "未分类": [
    "Uncategorized",
    "Senza categoria",
    "Sin categoría",
    "Sem categoria"
  ],
  "暂无法核算": [
    "Calculation unavailable",
    "Calcolo non disponibile",
    "Cálculo no disponible",
    "Cálculo indisponível"
  ],
  "重新核算": [
    "Recalculate",
    "Ricalcola",
    "Recalcular",
    "Recalcular"
  ],
  "可用余额": [
    "Available balance",
    "Saldo disponibile",
    "Saldo disponible",
    "Saldo disponível"
  ],
  "售价*": [
    "Price*",
    "Prezzo*",
    "Precio*",
    "Preço*"
  ],
  "属性:": [
    "Attribute:",
    "Attributo:",
    "Atributo:",
    "Atributo:"
  ],
  "属性:颜色": [
    "Attribute:Color",
    "Attributo:Colore",
    "Atributo:Color",
    "Atributo:Cor"
  ],
  "属性:尺寸": [
    "Attribute:Size",
    "Attributo:Taglia",
    "Atributo:Talla",
    "Atributo:Tamanho"
  ],
  "变体": [
    "Variants",
    "Varianti",
    "Variantes",
    "Variantes"
  ],
  "每行一个实际变体，不生成属性组合。": [
    "One actual variant per row. Attribute combinations are not generated.",
    "Una variante effettiva per riga. Le combinazioni di attributi non vengono generate.",
    "Una variante real por fila. No se generan combinaciones de atributos.",
    "Uma variante real por linha. Não são geradas combinações de atributos."
  ],
  "售价必填，条码和商品编码列请设置为文本，保留前导零。": [
    "Price is required. Format barcode and product code columns as text to preserve leading zeros.",
    "Il prezzo è obbligatorio. Formatta le colonne del codice a barre e del codice prodotto come testo per mantenere gli zeri iniziali.",
    "El precio es obligatorio. Usa formato de texto para los códigos de barras y de producto para conservar los ceros iniciales.",
    "O preço é obrigatório. Formate as colunas de código de barras e código do produto como texto para preservar os zeros iniciais."
  ],
  "属性列以“属性:”开头，例如“属性:口味”。无属性时填写规格。": [
    "Attribute columns start with “Attribute:”, e.g. “Attribute:Flavor”. Enter a specification if there are no attributes.",
    "Le colonne degli attributi iniziano con “Attributo:”, ad esempio “Attributo:Gusto”. Inserisci una specifica se non ci sono attributi.",
    "Las columnas de atributos comienzan con “Atributo:”, por ejemplo “Atributo:Sabor”. Indica una especificación si no hay atributos.",
    "As colunas de atributos começam por “Atributo:”, por exemplo “Atributo:Sabor”. Indique uma especificação se não houver atributos."
  ],
  "相同属性组合或规格覆盖当前草稿，其余新增；导入后检查并点击保存。": [
    "Matching attributes or specifications replace the current draft; others are added. Review and save after import.",
    "Gli attributi o le specifiche corrispondenti sostituiscono la bozza attuale; gli altri vengono aggiunti. Controlla e salva dopo l’importazione.",
    "Los atributos o especificaciones coincidentes reemplazan el borrador actual; los demás se añaden. Revisa y guarda después de importar.",
    "Os atributos ou especificações correspondentes substituem o rascunho atual; os restantes são adicionados. Reveja e guarde após a importação."
  ],
  "填写说明": [
    "Instructions",
    "Istruzioni",
    "Instrucciones",
    "Instruções"
  ],
  "商品变体.xlsx": [
    "Product variants.xlsx",
    "Varianti prodotto.xlsx",
    "Variantes de producto.xlsx",
    "Variantes de produto.xlsx"
  ],
  "联网后可用": [
    "Available when online",
    "Disponibile online",
    "Disponible con conexión",
    "Disponível com ligação à Internet"
  ],
  "单机版仅支持现金结算，请取消优惠券、积分及附加服务": [
    "Local mode only supports cash payments. Remove coupons, points and additional services.",
    "La modalità locale supporta solo contanti. Rimuovi coupon, punti e servizi aggiuntivi.",
    "El modo local solo admite efectivo. Quita cupones, puntos y servicios adicionales.",
    "O modo local só aceita pagamentos em numerário. Remova cupões, pontos e serviços adicionais."
  ],
  "本机商品资料不完整，请检查商品设置后重试": [
    "Local product details are incomplete. Check product settings and try again.",
    "I dati locali del prodotto sono incompleti. Controlla le impostazioni e riprova.",
    "Los datos locales del producto están incompletos. Revisa la configuración e inténtalo de nuevo.",
    "Os dados locais do produto estão incompletos. Verifique as definições e tente novamente."
  ],
  "请先退出当前云端账号，再修改云端地址": [
    "Sign out of the current cloud account before changing the cloud address.",
    "Esci dall’account cloud attuale prima di modificare l’indirizzo cloud.",
    "Cierra la sesión de la cuenta en la nube antes de cambiar la dirección.",
    "Termine sessão na conta atual da nuvem antes de alterar o endereço."
  ],
  "云端地址不正确": [
    "Invalid cloud address",
    "Indirizzo cloud non valido",
    "Dirección de nube no válida",
    "Endereço da nuvem inválido"
  ],
  "商品多语言翻译": [
    "Product translations",
    "Traduzioni dei prodotti",
    "Traducciones de productos",
    "Traduções dos produtos"
  ]
});

for (const [key, value] of Object.entries(portuguese)) { if (phrases[key]) phrases[key][3] = value; }

const patterns: Array<[RegExp, (match: RegExpMatchArray, lang: 0 | 1 | 2 | 3) => string]> = [
  [/^共\s*(\d+)\s*件商品$/, (m, l) => l === 3 ? `${m[1]} produtos` : l === 2 ? `${m[1]} productos` : l === 0 ? `${m[1]} products` : `${m[1]} prodotti`],
  [/^共\s*(\d+)\s*条$/, (m, l) => l === 3 ? `${m[1]} registos` : l === 2 ? `${m[1]} registros` : l === 0 ? `${m[1]} records` : `${m[1]} record`],
  [/^数量：?\s*(\d+)\s*件$/, (m, l) => l === 3 ? `Quantidade: ${m[1]}` : l === 2 ? `Cantidad: ${m[1]}` : l === 0 ? `Quantity: ${m[1]}` : `Quantità: ${m[1]}`],
  [/^当前订单\s*·\s*(\d+)\s*件$/, (m, l) => l === 3 ? `Encomenda atual · ${m[1]} artigos` : l === 2 ? `Pedido actual · ${m[1]} artículos` : l === 0 ? `Current order · ${m[1]} items` : `Ordine corrente · ${m[1]} articoli`],
  [/^(\d+)\s*笔销售订单$/, (m, l) => l === 3 ? `${m[1]} encomendas de venda` : l === 2 ? `${m[1]} pedidos de venta` : l === 0 ? `${m[1]} sales orders` : `${m[1]} ordini di vendita`],
  [/^已处理\s*(\d+)\s*\/\s*(\d+)\s*笔$/, (m, l) => l === 3 ? `Processados ${m[1]} / ${m[2]}` : l === 2 ? `Procesados ${m[1]} / ${m[2]}` : l === 0 ? `Processed ${m[1]} / ${m[2]}` : `Elaborati ${m[1]} / ${m[2]}`],
  [/^待上传\s*(\d+)\s*笔订单，上传成功后自动移出队列。$/, (m, l) => l === 3 ? `${m[1]} encomendas pendentes. As enviadas saem da fila automaticamente.` : l === 2 ? `${m[1]} pedidos pendientes. Los subidos se eliminan de la cola automáticamente.` : l === 0 ? `${m[1]} orders pending. Successful uploads leave the queue automatically.` : `${m[1]} ordini in attesa. Quelli caricati vengono rimossi automaticamente.`],
  [/^缓存更新于\s*(.+)$/, (m, l) => l === 3 ? `Cache atualizada ${m[1]}` : l === 2 ? `Caché actualizada ${m[1]}` : l === 0 ? `Cache updated ${m[1]}` : `Cache aggiornata ${m[1]}`],
  [/^数量\s+(.+)$/, (m, l) => l === 3 ? `Quantidade ${m[1]}` : l === 2 ? `Cantidad ${m[1]}` : l === 0 ? `Quantity ${m[1]}` : `Quantità ${m[1]}`],
  [/^(\d+)\s*条\/页$/, (m, l) => l === 3 ? `${m[1]} linhas/página` : l === 2 ? `${m[1]} filas/página` : l === 0 ? `${m[1]} rows/page` : `${m[1]} righe/pagina`],
  [/^第\s*(\d+)\s*页$/, (m, l) => l === 3 ? `Página ${m[1]}` : l === 2 ? `Página ${m[1]}` : l === 0 ? `Page ${m[1]}` : `Pagina ${m[1]}`],
  [/^全部门店（(\d+)）$/, (m, l) => l === 3 ? `Todas as lojas (${m[1]})` : l === 2 ? `Todas las tiendas (${m[1]})` : l === 0 ? `All stores (${m[1]})` : `Tutti i negozi (${m[1]})`],
  [/^门店筛选：全部门店（(\d+)）$/, (m, l) => l === 3 ? `Filtro de lojas: Todas (${m[1]})` : l === 2 ? `Filtro de tiendas: Todas (${m[1]})` : l === 0 ? `Store filter: All stores (${m[1]})` : `Filtro negozi: Tutti (${m[1]})`],
  [/^现金实收\s+(.+)\s+／\s+找零\s+(.+)$/, (m, l) => l === 3 ? `Numerário recebido ${m[1]} / Troco ${m[2]}` : l === 2 ? `Efectivo recibido ${m[1]} / Cambio ${m[2]}` : l === 0 ? `Cash received ${m[1]} / Change ${m[2]}` : `Contanti ricevuti ${m[1]} / Resto ${m[2]}`],
  [/^(\d+)\s*行通过\s*·\s*(\d+)\s*行错误$/, (m, l) => l === 3 ? `${m[1]} válidas · ${m[2]} erros` : l === 2 ? `${m[1]} válidas · ${m[2]} errores` : l === 0 ? `${m[1]} valid · ${m[2]} errors` : `${m[1]} valide · ${m[2]} errori`],
  [/^确认创建\s*(\d+)\s*件商品$/, (m, l) => l === 3 ? `Criar ${m[1]} produtos` : l === 2 ? `Crear ${m[1]} productos` : l === 0 ? `Create ${m[1]} products` : `Crea ${m[1]} prodotti`],
  [/^卡号\s+(.+)$/, (m, l) => l === 3 ? `Cartão ${m[1]}` : l === 2 ? `Tarjeta ${m[1]}` : l === 0 ? `Card ${m[1]}` : `Tessera ${m[1]}`],
  [/^小计\s+(.+)$/, (m, l) => l === 3 ? `Subtotal ${m[1]}` : l === 2 ? `Subtotal ${m[1]}` : l === 0 ? `Subtotal ${m[1]}` : `Subtotale ${m[1]}`],
  [/^应付\s+(.+)$/, (m, l) => l === 3 ? `A pagar ${m[1]}` : l === 2 ? `Pendiente ${m[1]}` : l === 0 ? `Due ${m[1]}` : `Dovuto ${m[1]}`],
];

const messageTemplates: Array<[RegExp, Translation]> = Object.entries(phrases)
  .filter(([key]) => /\{\d+\}/.test(key))
  .map(([key, values]) => [new RegExp('^' + key.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? '(.*?)' : part.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&')).join('') + '$'), values]);

export function setLocale(value: string) {
  if (!supported.includes(value as Locale)) return;
  locale.value = value as Locale;
  localStorage.setItem(STORAGE_KEY, value);
}

export function translate(value: string) {
  if (locale.value === "zh-CN" || !value) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const source = value.trim();
  const language: 0 | 1 | 2 | 3 = locale.value === "en-US" ? 0 : locale.value === "it-IT" ? 1 : locale.value === "pt-PT" ? 3 : 2;
  const direct = phrases[source]?.[language];
  if (direct) return leading + direct + trailing;
  for (const [key, values] of messageTemplates) {
    const match = source.match(key);
    if (match && values[language]) return leading + values[language]!.replace(/\{(\d+)\}/g, (_, i) => match[Number(i) + 1] ?? '') + trailing;
  }
  for (const [pattern, format] of patterns) {
    const match = source.match(pattern);
    if (match) return leading + format(match, language) + trailing;
  }
  return value;
}

export function formatMoney(value: any, currency = "CNY") {
  try {
    return new Intl.NumberFormat(locale.value, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return new Intl.NumberFormat(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
  }
}

export function formatDateTime(value: Date | string | number) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

// Vue renders translated copy reactively. Never mutate rendered text or business data.
watch(locale, value => { document.documentElement.lang = value; document.title = translate("RO POS · 门店收银"); }, { immediate: true });

/** Translate UI copy only. Parameters are preserved verbatim, including business names. */
export function t(key: string | null | undefined, params: readonly unknown[] = []): string {
  return translate(key || "").replace(/\{(\d+)\}/g, (token, index) => index in params ? String(params[Number(index)] ?? '') : token);
}

/** Accepted spreadsheet labels across all supported languages. */
export function translationVariants(key: string): string[] {
  return [key, ...(phrases[key] || [])].filter((value): value is string => Boolean(value));
}
