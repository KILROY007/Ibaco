import React from 'react'
import { ComponentBase } from 'resub'
import { Container, Text, Input, Item, Card } from 'native-base'

export class OTPComponent extends ComponentBase<any, any> {

  constructor(props: any) {
    super(props)
  }

  public render() {
    return (
      <Container style={{ flex: 1, backgroundColor: 'red' }}>
      </Container >
    )
  }
}
