'use client';
import { useState } from 'react'
import styles from './sidebar.module.css'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faInfoCircle, faBars, faXmark, faRightFromBracket, faPlus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faReddit } from '@fortawesome/free-brands-svg-icons';

function App() {
  const [animate,setanimate] = useState('0px');
  const [icon,seticon] = useState(faBars);
  const [link_animate, setlink_animate] = useState('none');

  return (
    <div className={styles.main}>
      <div className={styles.sidebar} style={{width:animate}}>
        <h1 className={styles.title}>Insert Name</h1>
        <Link className={`${styles.Link} ${link_animate === 'link-animate' ? styles['link-animate'] : ''}`} href='/' ><FontAwesomeIcon icon={faHome} />&nbsp;Home</Link>
        <Link className={`${styles.Link} ${link_animate === 'link-animate' ? styles['link-animate'] : ''}`} href='/add'><FontAwesomeIcon icon={faSquarePlus} />&nbsp;Add</Link>
        <Link className={`${styles.Link} ${link_animate === 'link-animate' ? styles['link-animate'] : ''}`} href='' ><FontAwesomeIcon icon={faInfoCircle} />&nbsp;About</Link>
        <Link href='/login' className={`${styles.logout} ${link_animate === 'link-animate' ? styles['link-animate'] : ''}`} onClick={async()=>{
          const response = fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
            credentials: 'include'
          });
        }}>Logout&nbsp;<FontAwesomeIcon icon={faRightFromBracket} /></Link>
      </div>
      <div className={styles.icon}>
        <FontAwesomeIcon icon={icon} style={{marginTop:'23px',marginBottom:'500px',cursor:'pointer'}} onClick={() => {setanimate((cur)=> cur === '0px'? '250px' : '0px');
          seticon((cur)=> cur === faBars? faXmark: faBars),
          setlink_animate((cur) => cur === 'link-animate'? 'none' : 'link-animate');
        }}/>
        <Link href=''><FontAwesomeIcon className={styles.social} icon={faFacebook} /></Link>
        <Link href=''><FontAwesomeIcon className={styles.social} icon={faInstagram} /></Link>
        <Link href=''><FontAwesomeIcon className={styles.social} icon={faReddit} /></Link>
      </div>
    </div>
  )
}

export default App
