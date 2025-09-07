'use client';
import App from '../components/sidebar.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faCheck, faSpinner, faArrowUp } from '@fortawesome/free-solid-svg-icons'
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
  const [editingId, setEditingId] = useState(null);
  const [access,setaccess] = useState('false');
  const [display, setdisplay] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY !== 0) {
        setdisplay(1);
      } else {
        setdisplay(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetch_data = async function () {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
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
  }, [render, router])
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
                  <div className={styles.top} style={{display: editingId === row.id ? 'none' : 'flex'}}>
                    <h1 className={styles.titles}>{row.title}</h1>
                    <FontAwesomeIcon className={styles.icon} icon={faTrashCan} onClick={async () => {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
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
                    <FontAwesomeIcon className={styles.icon} icon={faPenToSquare} onClick={() => setEditingId(row.id)}/>
                  </div>
                  <p className={styles.text} style={{display: editingId === row.id ? 'none' : 'flex'}}>{row.content}</p>
                  <p className={styles.time} style={{display: editingId === row.id ? 'none' : 'flex'}}>Last Updated: &nbsp;{row.updated_at}</p>
                <form className={styles.edit} style={{display: editingId === row.id ? 'flex' : 'none'}}>
                  <div className={styles.top}>
                    <input
                      className={styles.edittitles}
                      value={row.title}
                      onChange={e => {
                        const newNotes = notes.map((note, i) =>
                          note.id === row.id ? { ...note, title: e.target.value } : note
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
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
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
                        setEditingId(null);
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
                        note.id === row.id ? { ...note, content: e.target.value } : note
                      );
                      setnotes(newNotes);
                      setfnotes(newNotes); // <-- Add this line
                    }}
                  />
                  <label className={styles.label}> Color
                    <input className={styles.color} type='color' value={row.color} 
                    onChange={e => {
                      const newNotes = notes.map((note, i) =>
                        note.id === row.id ? { ...note, color: e.target.value } : note
                      );
                      setnotes(newNotes);
                      setfnotes(newNotes); // <-- Add this line
                    }}/></label>
                </form>
              </li>
            ))}
          </ul>
                    <div className={styles.circle} style={{opacity:display}} onClick={()=>window.scrollTo({top:0, behavior: 'smooth'})}>
            <FontAwesomeIcon icon={faArrowUp} />
          </div>
        </div>
      </div>
    );
  }
}
