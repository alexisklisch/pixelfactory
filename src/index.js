import { processWorkspace } from "./functions/processWorkspace.js"

class DsgnResolver  {
  constructor(dsgn, config = { isServer: false }) {
    this.dsgn = dsgn
    this.config = config
    this.designs = []
  }

  async getImages() {
    const promises = this.dsgn.workspaces.map(wrksp => this.#processWorkspace(wrksp))
    this.designs = await Promise.all(promises)
    return this.designs
  }

  #processWorkspace(workspace) {
    return new Promise(async (resolve, reject) => {
      try {
        const blob = await processWorkspace(workspace, this.config)
        resolve(blob)
      } catch (error) {
        reject(error)
      }
    })
  }
}

export { DsgnResolver }