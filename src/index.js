class DsgnResolver  {
  constructor(dsgn, config = { isServer: false }) {
    this.dsgn = dsgn
    this.config = config
    this.designs = []
  }

  async getImages() {
    const promises = this.dsgn.workspaces.map(wrksp => this.#processWorkspaceInWorker(wrksp))
    this.designs = await Promise.all(promises)
    return this.designs
  }

  #processWorkspaceInWorker(workspace) {
    return new Promise((resolve, reject) => {

      const worker = new Worker(new URL('./workers/convertWorker.worker.js', import.meta.url), { type: "module", name: 'convertWorker' })
      
      worker.postMessage({workspace, config: this.config})  // Enviar el workspace al worker

      worker.onmessage = (event) => {
        const blob = event.data
        if (blob.error) {
          reject(new Error(blob.error))
        } else {
          resolve(blob)
        }
        worker.terminate()  // Finalizar el worker cuando termine el trabajo
      }

      worker.onerror = (err) => {
        reject(err)
        worker.terminate()
      }
    })
  }
}

export { DsgnResolver }