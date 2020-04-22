import React, { Component } from 'react'
import moment from 'moment'
import 'moment/locale/fr'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import InterTitle from 'libe-components/lib/text-levels/InterTitle'
import AnnotationTitle from 'libe-components/lib/text-levels/AnnotationTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import JSXInterpreter from 'libe-components/lib/logic/JSXInterpreter'
import { parseTsv } from 'libe-utils'

moment.locale('fr')

export default class App extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'lblb-est-ce-que-c-est-demain'
    this.state = {
      loading_sheet: true,
      error_sheet: null,
      data_sheet: [],
      keystrokes_history: [],
      konami_mode: false
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.listenToKeyStrokes = this.listenToKeyStrokes.bind(this)
    this.watchKonamiCode = this.watchKonamiCode.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    document.addEventListener('keydown', this.listenToKeyStrokes)
    this.fetchCredentials()
    if (this.props.spreadsheet) return this.fetchSheet()
    return this.setState({ loading_sheet: false })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * WILL UNMOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentWillUnmount () {
    document.removeEventListener('keydown', this.listenToKeyStrokes)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * SHOULD UPDATE
   *
   * * * * * * * * * * * * * * * * */
  shouldComponentUpdate (props, nextState) {
    const changedKeys = []
    Object.keys(nextState).forEach(key => {
      if (this.state[key] !== nextState[key]) changedKeys.push(key)
    })
    if (changedKeys.length === 1 &&
      changedKeys.includes('keystrokes_history')) return false
    return true
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH CREDENTIALS
   *
   * * * * * * * * * * * * * * * * */
  async fetchCredentials () {
    const { api_url } = this.props
    const { format, article } = this.props.tracking
    const api = `${api_url}/${format}/${article}/load`
    try {
      const reach = await window.fetch(api, { method: 'POST' })
      const response = await reach.json()
      const { lblb_tracking, lblb_posting } = response._credentials
      if (!window.LBLB_GLOBAL) window.LBLB_GLOBAL = {}
      window.LBLB_GLOBAL.lblb_tracking = lblb_tracking
      window.LBLB_GLOBAL.lblb_posting = lblb_posting
      return { lblb_tracking, lblb_posting }
    } catch (error) {
      console.error('Unable to fetch credentials:')
      console.error(error)
      return Error(error)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH SHEET
   *
   * * * * * * * * * * * * * * * * */
  async fetchSheet () {
    this.setState({ loading_sheet: true, error_sheet: null })
    const sheet = this.props.spreadsheet
    try {
      const reach = await window.fetch(this.props.spreadsheet)
      if (!reach.ok) throw reach
      const data = await reach.text()
      const parsedData = parseTsv(data, [7])[0]
      this.setState({ loading_sheet: false, error_sheet: null, data_sheet: parsedData })
      return data
    } catch (error) {
      if (error.status) {
        const text = `${error.status} error while fetching : ${sheet}`
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(text, error)
        return Error(text)
      } else {
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(error)
        return Error(error)
      }
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * START LISTENING KEYSTROKES
   *
   * * * * * * * * * * * * * * * * */
  listenToKeyStrokes (e) {
    if (!e || !e.keyCode) return
    const currHistory = this.state.keystrokes_history
    const newHistory = [...currHistory, e.keyCode]
    this.setState({ keystrokes_history: newHistory })
    this.watchKonamiCode()
  }

  /* * * * * * * * * * * * * * * * *
   *
   * WATCH KONAMI CODE
   *
   * * * * * * * * * * * * * * * * */
  watchKonamiCode () {
    const konamiCodeStr = '38,38,40,40,37,39,37,39,66,65'
    const lastTenKeys = this.state.keystrokes_history.slice(-10)
    if (lastTenKeys.join(',') === konamiCodeStr) this.setState({ konami_mode: true })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    const { end_date: endDate, end_time: endTime, no, yes, today, passed } = state.data_sheet[0]
    const endMomentStr = `${endDate} ${endTime}`
    const endMoment = moment(endMomentStr, 'YYYY/MM/DD HH:mm')
    // const nowMoment = moment('2020/05/11 13:30', 'YYYY/MM/DD HH:mm')
    const nowMoment = moment()
    const daysDiff = endMoment.diff(nowMoment, 'days', true)
    const isPassed = endMoment.diff(nowMoment) <= 0
    const endMomentToMidnight = moment(endMoment).startOf('day')
    const nowMomentToMidnight = moment(nowMoment).startOf('day')
    const diffToMidnight = endMomentToMidnight.diff(nowMomentToMidnight, 'days')    

    const question = state.data_sheet[0].question
    const answer = diffToMidnight > 1
      ? no.replace(/<<MOMENT>>/igm, endMoment.from(nowMoment).replace(/il\sy\sa\s/igm, '').replace(/dans\s/igm, ''))
      : diffToMidnight === 1
      ? yes.replace(/<<MOMENT>>/igm, endMoment.from(nowMoment).replace(/il\sy\sa\s/igm, '').replace(/dans\s/igm, ''))
      : isPassed
      ? passed.replace(/<<MOMENT>>/igm, endMoment.from(nowMoment).replace(/il\sy\sa\s/igm, '').replace(/dans\s/igm, ''))
      : today.replace(/<<MOMENT>>/igm, endMoment.from(nowMoment).replace(/il\sy\sa\s/igm, '').replace(/dans\s/igm, ''))

    /* Display component */
    return <div className={classes.join(' ')}>
      <div className={`${c}__question`}>
        <Paragraph literary huge level={1}>
          <JSXInterpreter content={question} />
        </Paragraph>
      </div>
      <div className={`${c}__answer`}>
        <InterTitle>
          <JSXInterpreter content={answer} />
        </InterTitle>
      </div>
      <div className={`${c}__links`}>
        <AnnotationTitle big>Pour passer le temps</AnnotationTitle>
        <Paragraph><a href='/'>Un lien</a></Paragraph>
        <Paragraph><a href='/'>Un lien</a></Paragraph>
        <Paragraph><a href='/'>Un lien</a></Paragraph>
      </div>
      <div className='lblb-default-apps-footer'>
        <ShareArticle short iconsOnly tweet={props.meta.tweet} url={props.meta.url} />
        <LibeLaboLogo target='blank' />
      </div>
    </div>
  }
}
