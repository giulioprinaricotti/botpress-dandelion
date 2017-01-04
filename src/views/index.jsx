import React from 'react'
import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Alert,
  Button
} from 'react-bootstrap'

import style from './style.scss'


export default class TemplateModule extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      message: null,
      initialStateHash: null
    }

    this.renderAccessToken = this.renderAccessToken.bind(this)
    this.handleAccesTokenChange = this.handleAccesTokenChange.bind(this)
    this.handleSaveChanges = this.handleSaveChanges.bind(this)
  }

  getStateHash() {
    return this.state.accessToken
  }

  getAxios() {
    return this.props.bp.axios
  }

  componentDidMount() {
    this.getAxios().get('/api/botpress-dandelion/config')
    .then((res) => {
      this.setState({
        loading: false,
        ...res.data
      })

      setImmediate(() => {
        this.setState({ initialStateHash: this.getStateHash() })
      })
    })
  }

  handleAccesTokenChange(event) {
    this.setState({
      accessToken: event.target.value
    })
  }

  handleSaveChanges() {
    this.setState({ loading:true })

    return this.getAxios().post('/api/botpress-dandelion/config', {
      accessToken: this.state.accessToken
    })
    .then(() => {
      this.setState({
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
    .catch((err) => {
      this.setState({
        message: {
          type: 'danger',
          text: 'An error occured during you were trying to save configuration: ' + err.response.data.message
        },
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
  }

  renderAccessToken() {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Access Token
          </Col>
          <Col sm={8}>
            <FormControl type="text" value={this.state.accessToken} onChange={this.handleAccesTokenChange}/>
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderMessageAlert() {
    return this.state.message
      ? <Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>
      : null
  }

  renderSaveButton() {
    const opacityStyle = (this.state.initialStateHash && this.state.initialStateHash !== this.getStateHash())
      ? {opacity:1}
      : {opacity:0}

    return <Button style={opacityStyle} bsStyle="success" onClick={this.handleSaveChanges}>Save</Button>
  }

  render() {
    if (this.state.loading) {
      return <h4>Module is loading...</h4>
    }

    return (
      <Grid className={style.dandelion}>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.renderMessageAlert()}
            <Panel className={style.panel} header="Settings">
              {this.renderSaveButton()}
              <div className={style.settings}>
                {this.renderAccessToken()}
              </div>
            </Panel>
          </Col>
        </Row>
      </Grid>

    )
  }
}
