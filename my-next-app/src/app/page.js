'use client';
import App from '../components/sidebar.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import styles from './page.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [notes, setnotes] = useState([]);
  const [fnotes, setfnotes] = useState([]);
  const [render, setrender] = useState(1);
  const [open, setopen] = useState('flex');
  const [access,setaccess] = useState('false');
  useEffect(() => {
    const fetch_data = async function () {
      const response = await fetch('http://localhost:3001/', {
        credentials: 'include'
      })
      if(response.status === 401)
      {
        router.push('/login');
        return;
      }
      else
      {
        setaccess('True');
      }
      const data = await response.json();
      console.log(data.Notes);
      setnotes(data.Notes);
      setfnotes(data.Notes); // Show all notes by default
    }
    fetch_data();
  }, [render])
  if(access === 'false')
  {
    return(
      <div className={styles.loading_screen}>
        <FontAwesomeIcon className={styles.spinner} icon={faSpinner}/>
        <p>Authenticating your session...</p>
      </div>
    );
  }
  else
  {
    return (
      <div className={styles.container}>
        <App />
        <div className={styles.mainContent}>
          <div className={styles.topbar}>
            <h1 className={styles.title}>My Notes</h1>
            <div className={styles.plusIconContainer}>
              <Link href='/add'><FontAwesomeIcon icon={faPlus} className={styles.plusIcon} /></Link>
            </div>
          </div>
          <input placeholder='Search' 
            className={styles.searchBar}
            onChange={e => {
              const value = e.target.value.toLowerCase();
              if (value === "") {
                setfnotes(notes); 
              } else {
                const filter = notes.filter(note =>
                  note.content.toLowerCase().includes(value)
                );
                setfnotes(filter);
              }
            }}/>
          <ul className={styles.notes}>
            {fnotes.map((row, idx) => (
              <li className={styles.note} key={idx} style={{backgroundColor:row.color}}>
                  <div className={styles.top} style={{display:open}}>
                    <h1 className={styles.titles}>{row.title}</h1>
                    <FontAwesomeIcon className={styles.icon} icon={faTrashCan} onClick={async () => {
                      const response = await fetch('http://localhost:3001/', {
                        method: 'DELETE',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: row.id }),
                        credentials: 'include'
                      });
                      if (response.status === 200) {
                        setrender(cur => cur + 1);
                      }
                    }} />
                    <FontAwesomeIcon className={styles.icon} icon={faPenToSquare} onClick={()=>setopen('none')}/>
                  </div>
                  <p className={styles.text} style={{display:open}}>{row.content}</p>
                  <p className={styles.time} style={{display:open}}>Last Updated: &nbsp;{row.updated_at}</p>
                <form className={styles.edit} style={{display: open === 'flex'? 'none' : 'flex'}}>
                  <div className={styles.top}>
                    <input
                      className={styles.edittitles}
                      value={row.title}
                      onChange={e => {
                        const newNotes = notes.map((note, i) =>
                          i === idx ? { ...note, title: e.target.value } : note
                        );
                        setnotes(newNotes);
                        setfnotes(newNotes); // <-- Add this line
                      }}
                    />
                    <FontAwesomeIcon
                      className={styles.icon}
                      icon={faCheck}
                      onClick={async () => {
                        console.log(row.color);
                        const response = await fetch('http://localhost:3001/', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            id: row.id,
                            title: row.title,
                            content: row.content,
                            color: row.color
                          }),
                          credentials: 'include'
                        });
                        setopen('flex');
                        if (response.status === 200) {
                          setrender(cur => cur + 1);
                        }
                      }}
                    />
                  </div>
                  <textarea
                    className={styles.edittext}
                    value={row.content}
                    onChange={e => {
                      const newNotes = notes.map((note, i) =>
                        i === idx ? { ...note, content: e.target.value } : note
                      );
                      setnotes(newNotes);
                      setfnotes(newNotes); // <-- Add this line
                    }}
                  />
                  <input className={styles.color} placeholder='Set color of note' value={row.color} 
                  onChange={e => {
                    const newNotes = notes.map((note, i) =>
                      i === idx ? { ...note, color: e.target.value } : note
                    );
                    setnotes(newNotes);
                    setfnotes(newNotes); // <-- Add this line
                  }}/>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
