import React, { Component } from "react";

import Playlist from "./Playlist";
import MutualPlaylists from "./MutualPlaylists";
import GroupsTab, { IGroup } from "./GroupsTab";
import Player from "./Player";


interface IProps {
    location: Location
}

interface IState {
  playlist_data?: string,
  group_data: IGroup[],
  readyState: number
}

const wsAddr = "ws://138.251.29.150:8081"

export default class App extends Component<IProps, IState> {
    private code: string;
    private client: WebSocket;

    constructor (props: IProps) {
        super(props);
        this.state = {
          group_data: [],
          readyState: 0
        }
        this.code = props.location.search.slice(6);
        this.client = new WebSocket(wsAddr);
    }

    componentDidMount() {
        this.client.onopen = () => {
            console.log("Connection established");
            console.log("Sending to server");

            let authCodeMessage = {
                'type':'authCode',
                'code':this.code
            }
            this.client.send(JSON.stringify(authCodeMessage));
            this.setState({readyState:this.client.readyState});
        }
        this.client.onmessage = (event) => {
            console.log("Message from server: " + event.data);
            console.log(event.data)
            var response = JSON.parse(event.data);
            switch(response.type){
                case 'response_playlists':
                    console.log(response.data)
                    this.setState({
                        playlist_data: JSON.stringify(response.data)
                    })
                    break;
                case 'advertising_groups':
                    // console.log(response.data)
                    this.setState({group_data:response.data})
                    break;
                default:
            }
        }
        this.client.onclose = (event) => {
            if (event.wasClean) {
                console.log("Connection closed cleanly");
            } else {
                console.log("Connection died");
            }
        }
        this.client.onerror = (error: Event) => {
            console.log("Error: " + error.returnValue);
        }
    }

    render() {
        if(this.state.readyState == 1){
            return(
                <div>
                    <Playlist
                        playlist_data={this.state.playlist_data}
                        code={this.code}
                        client={this.client}
                        />


                    <MutualPlaylists
                        code={this.code}
                        client={this.client}
                        />

                    <GroupsTab
                        groups={this.state.group_data}
                        code={this.code}
                        client={this.client}
                        />

                    <Player
                        code={this.code}
                        client={this.client}
                        />

                </div>
            )
        } else {
            return <h1>{this.code}</h1>;

        }
    }
}
