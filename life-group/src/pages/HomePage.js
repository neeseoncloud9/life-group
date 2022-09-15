import React, { useState } from 'react';
import { SuperBalls } from '@uiball/loaders'

const HomePage = (props) => {
    const _axios                      = props.props.axios;
    const [err, setErr]               = useState("");
    const [errMsg, setErrMsg]         = useState("");
    const [loaded, setLoaded]         = useState(false);
    const [lifeGroups, setLifeGroups] = useState({});

    if (!loaded) {
        _axios.get('http://localhost:3001/', {
            withCredentials: true
        }).then((result) => {
            if (result.error) {
                setErr(true);
                setErrMsg(result.msg);
                setLoaded(true);
            } else {
                console.log(result.data.life_groups);
                setLifeGroups(result.data.life_groups);
                setLoaded(true);
            }
        });
    }

    const convertTime = (timeString) => {
        return new Date('1970-01-01T' + timeString + 'Z').toLocaleTimeString('en-US',{timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'});
    }

    return (
        <>
        {
            !loaded &&
            <div className='mt-5 d-flex justify-content-center'>
                <SuperBalls 
                    size={100}
                    speed={1.4} 
                    color="black" 
                />
            </div>
        }
        {
            err &&
            <h3 className="text-center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        {
            loaded &&
            <table className='table table-success table-striped'>
                <tbody>
                    {lifeGroups.map((e, i) => {
                        return (
                            <tr key={e.ID}>
                                <th scope="row">
                                    {e.name}<br/>
                                    <span className='fs-6 fw-lighter'>{e.co_leader_name ? `Leader: ${e.leader_name} Co-leader: ${e.co_leader_name}` : `Leader: ${e.leader_name}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{e.meeting_interval === 'Weekly' ? `${e.day_meet}'s @${convertTime(e.time_meet)}` : `${e.meeting_interval}: ${e.day_meet} @${convertTime(e.time_meet)}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{`Location: ${e.location}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{}</span><br/>
                                    <span className='fs-6 fw-lighter'>{}</span><br/>
                                    <span className='fs-6 fw-lighter'>{}</span><br/>
                                </th>
                                <td>

                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        }
        </>
    )
};

export default HomePage;