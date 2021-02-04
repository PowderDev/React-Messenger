import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../redux/actions";
import { Menu, Icon, Modal, Form, Input, Button, Label } from "semantic-ui-react";

class Channels extends React.Component {
  state = {
    activeChannel: null,
    user: this.props.curUser,
    channels: [],
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    modal: false,
    firstLoad: true,
    savedChannel: +localStorage.getItem('curNum') || 0,
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    curChannel: null,
    typingRef: firebase.database().ref('typing')

  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setSavedChannel(this.state.savedChannel));
      this.addNotificationsListeners(snap.key)
    });

    this.state.channelsRef.on('child_removed', snap =>{
      this.state.messagesRef.child(snap.key).remove(err => console.log(err))
      this.setState({ channels: this.state.channels.filter(channel => channel.id !== snap.key ) })
    })

  };

  setSavedChannel = (savedChannel) => {
      this.props.setCurrentChannel(this.state.channels[savedChannel]);
      this.setState({activeChannel: savedChannel})
      if(this.state.channels[savedChannel]){
        this.setState({curChannel: this.state.channels[savedChannel].id})
      }
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach(channel =>{
        this.state.messagesRef.child(channel.id).off()
    })
  };

  addNotificationsListeners = channelId =>{
    this.state.messagesRef.child(channelId).on('value', snap =>{

      this.handleNotifications(channelId, this.state.curChannel, this.state.notifications, snap)
    })
  }

  handleNotifications = (channelId, curChannelId, notifications, snap) =>{
    let lastTotal = 0

    let index = notifications.findIndex(notif => notif.id === channelId)

    if (index !== -1){
      if (channelId !== curChannelId){
        lastTotal = notifications[index].total

        if (snap.numChildren() - lastTotal > 0){
          notifications[index].count = snap.numChildren() - lastTotal
        }
      }


      notifications[index].lastKnownTotal = snap.numChildren()

    }else{
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      })
    }

    this.setState({ notifications })
  }

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeChannel = (channel, i) => {
    this.setState({activeChannel: i, curChannel: channel.id});
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    localStorage.setItem('curNum', `${i}`)
    this.clearNotifications()

    this.state.typingRef
      .child(channel.id)
      .child(this.state.user.uid)
      .remove()
  };

  clearNotifications = () =>{
    let index = this.state.notifications.findIndex(notif => notif.id === this.state.curChannel)
    
    if (index !== -1){
      let updateNotifications = [...this.state.notifications]
      updateNotifications[index].total = this.state.notifications[index].lastKnownTotal
      updateNotifications[index].count = 0
      this.setState({notifications: updateNotifications})
    }
  }

  getNotifications = (channel) =>{
    let count = 0

      if(this.state.curChannel === channel.id){
        return 
      }

      this.state.notifications.forEach(notif =>{
        if(notif.id === channel.id){
          count = notif.count
        }
      })
    
    if (count > 0) return count
  }

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map((channel, i) => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel, i)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={!this.props.isPrivate && i === this.state.activeChannel  }
      >
        {this.getNotifications(channel) && (
          <Label color='red'>{this.getNotifications(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item style={{fontSize: '1.15rem'}}>
            <span>
              <Icon name="exchange" /> Channels
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} style={{cursor: 'pointer'}} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        {/* Add Channel Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
