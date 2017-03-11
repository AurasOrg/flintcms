import React, { Component, PropTypes } from 'react';
import serialize from 'form-serialize';
import types from '../../utils/types';
import renderOption from '../../utils/renderOption';
import Page from '../../containers/Page';
import TitleBar from '../../components/TitleBar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Aside from '../../containers/Aside';
import { deleteEntry, updateEntry, entryDetails } from '../../actions/entryActions';

export default class Entry extends Component {
  static propTypes = {
    ...types.entries,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }

  static defaultProps = {
    title: '',
  }

  constructor(props) {
    super(props);
    this.renderFields = this.renderFields.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  state = { status: null }

  componentDidMount() {
    const { dispatch, params } = this.props;
    dispatch(entryDetails(params.id));
  }

  onSubmit(e) {
    e.preventDefault();
    const { params, dispatch } = this.props;
    const data = serialize(this.page.form, { hash: true });
    dispatch(updateEntry(params.id, data));
  }

  deleteEntry() {
    const { params, dispatch } = this.props;
    dispatch(deleteEntry(params.id));
  }

  renderFields(entryFields, fieldId) {
    const { fields } = this.props.fields;
    const foundField = fields.find(f => f._id === fieldId);
    const entryField = entryFields.find(f => f.fieldId === fieldId);
    return renderOption(foundField, entryField ? entryField.value : null);
  }

  render() {
    const { sections, params, entries } = this.props;

    const {
      section,
      title,
      _id,
      full,
      status,
      fields,
      dateCreated,
    } = entries.entries.find(e => e._id === params.id);

    // TODO: Render loader
    if (full === undefined) return null;

    const sectionObj = sections.sections.find(s => s._id === section);

    const links = [
      { label: 'Entries', path: '/admin/entries' },
      { label: sectionObj.title, path: `/admin/entries/${sectionObj.slug}` },
      { label: title, path: `/admin/entries/${sectionObj.slug}/${_id}` },
    ];

    return (
      <Page name="entry" links={links} onSubmit={this.onSubmit} ref={(r) => { this.page = r; }}>
        <TitleBar title={title}>
          <Button small onClick={this.Submit} type="submit">Save Entry</Button>
          <Button small onClick={this.deleteEntry}>Delete Entry</Button>
        </TitleBar>
        <div className="content">
          <div className="page__inner">
            <Input label="Title" defaultValue={title} name="title" full required />
            {sectionObj.fields.map(fieldId => this.renderFields(fields, fieldId))}
          </div>

          <Aside status={status} dateCreated={dateCreated} />
        </div>
      </Page>
    );
  }
}
