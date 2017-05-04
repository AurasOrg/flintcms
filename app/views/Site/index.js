import React, { Component, PropTypes } from 'react';
import serialize from 'form-serialize';
import Page from '../../containers/Page';
import Input from '../../components/Input';
import Fields from '../../components/Fields';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import Dropdown from '../../components/Fields/Dropdown';
import TitleBar from '../../components/TitleBar';
import { updateSite } from '../../actions/siteActions';
import t from '../../utils/types';

export default class Site extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    site: t.site.isRequired,
    usergroups: t.usergroups.isRequired,
  }
  static defaultProps = {
    dispatch: null,
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const data = serialize(this.page.form, { hash: true });
    this.props.dispatch(updateSite(data));
  }

  render() {
    const { usergroups, site } = this.props;
    const { siteName, siteUrl, siteLogo, defaultUserGroup } = site;
    const usergroupNames = usergroups.usergroups.map(u => ({ label: u.title, value: u._id }));

    return (
      <Page name="site-settings" onSubmit={this.handleSubmit} ref={(r) => { this.page = r; }}>
        <TitleBar title="Site Settings">
          <Button small type="submit">Save Changes</Button>
        </TitleBar>
        <div className="content">
          <div className="page__inner">
            <Dropdown
              label="Default User Group"
              instructions="The default user group new users will be assigned"
              name="defaultUserGroup"
              defaultValue={defaultUserGroup}
              options={[{ label: 'Admin', value: 'admin' }, ...usergroupNames]}
              onChange={this.handleDropdownChange}
            />
            <Checkbox label="Allow Public Registration" name="publicSignUp" />
            <Input label="Site Name" required name="siteName" defaultValue={siteName} full />
            <Input label="Site URL" required name="siteUrl" defaultValue={siteUrl} full />
            <Fields.Asset.component label="Site Logo" name="siteLogo" defaultValue={siteLogo} />
          </div>
        </div>
      </Page>
    );
  }
}
