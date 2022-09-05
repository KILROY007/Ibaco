import { AutoSubscribeStore, autoSubscribe, StoreBase } from 'resub'
import axios from 'axios'

@AutoSubscribeStore
export class BaseViewModel extends StoreBase {
  protected cancellationSource
  protected state: any

  constructor() {
    super()

  }
  createCancellationSource() {
    if (this.cancellationSource) {
      this.cancellationSource.cancel()
    }
    const CancelToken = axios.CancelToken
    this.cancellationSource = CancelToken.source()
  }

  public setState(newState: any) {
    this.state = newState
    this.trigger()
  }

  @autoSubscribe
  public getState() {
    return this.state
  }

  public clearError() {
    this.setState({
      ...this.state,
      error: undefined,
    })
  }

  protected defaultState() {
    return {

    }
  }

  public reset() {
    this.setState(this.defaultState())
  }

  public set(key: string, value: any) {
    const newState = {
      ...this.state,
    }
    newState[key] = value
    this.setState(newState)
  }

  public setMany(object) {
    const newState = {
      ...this.state,
    }
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        newState[key] = object[key]
      }
    }
    this.setState(newState)
  }

}