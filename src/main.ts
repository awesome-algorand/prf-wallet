import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import algosdk from 'algosdk'
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
        <button id="create" type="button">create</button>
        <button id="get" type="button">get</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
    
  </div>
`

function setupCreate(button: HTMLButtonElement){
    button.addEventListener('click', async () => {
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: new Uint8Array(32),
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 },
                    { type: 'public-key', alg: -8 },
                    { type: 'public-key', alg: -257 },
                ],
                rp: {
                    id: 'localhost',
                    name: 'Example',
                },
                extensions: {
                    prf: {},
                },
                authenticatorSelection: {
                    authenticatorAttachment: "cross-platform",
                    userVerification: 'preferred',
                    requireResidentKey: true,
                    residentKey: 'required',
                },
                user: {
                    id: new Uint8Array(32),
                    name: '',
                    displayName: '',
                }
            }
        })
        if(!credential){
            return
        }
        localStorage['credential'] = JSON.stringify([...new Uint8Array(credential.rawId)])
        const extensions: AuthenticationExtensionsClientOutputs & {prf?: {enabled?: boolean}} = (credential as PublicKeyCredential).getClientExtensionResults();
        if(extensions?.prf?.enabled){
            alert('prf enabled')
        }
    })
}
function setupGet(button: HTMLButtonElement){
    button.addEventListener('click', async () => {
        let rawId = localStorage['credential']
        if (!rawId) {
            return
        } else {
            rawId = new Uint8Array(JSON.parse(rawId))
        }
        const credential = await navigator.credentials.get({
            publicKey: {
                challenge: new Uint8Array(32),
                allowCredentials: [
                    {
                        type: 'public-key',
                        id: rawId,
                    },
                ],
                extensions: {
                    prf: {eval: {first: new TextEncoder().encode("Foo encryption key")}}
                },
                userVerification: 'preferred',
            }
        })
        if(!credential){
            return
        }
        const results = (credential as PublicKeyCredential).getClientExtensionResults();
        globalThis.mneomnic = algosdk.secretKeyToMnemonic(new Uint8Array(results.prf.results.first))
        globalThis.account = algosdk.mnemonicToSecretKey(globalThis.mneomnic)
        alert(`mneomnic: \n ${globalThis.mneomnic} \n account: ${globalThis.account.addr}`)
    })
}
setupCreate(document.querySelector<HTMLButtonElement>('#create')!)
setupGet(document.querySelector<HTMLButtonElement>('#get')!)

