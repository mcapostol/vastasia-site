(()=>{'use strict';
 const lang=document.documentElement.lang,params=new URLSearchParams(location.search),requested=params.get('lang');
 if(['ro','en','fr','de','es'].includes(requested)&&requested!==lang){const a=document.querySelector(`[data-lang="${requested}"]`);if(a){const u=new URL(a.href);params.delete('lang');u.search=params.toString();u.hash=location.hash;location.replace(u.href);return;}}
 document.querySelectorAll('[data-lang]').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('vastasia-language',a.dataset.lang)}catch{}}));
 const toggle=document.querySelector('.menu-toggle'),nav=document.getElementById('nav'),language=document.querySelector('.language');
 const close=()=>{nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(language)language.open=false};
 toggle?.addEventListener('click',()=>{const opening=toggle.getAttribute('aria-expanded')!=='true';close();toggle.setAttribute('aria-expanded',String(opening));nav.classList.toggle('open',opening)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=nav?.classList.contains('open');close();if(wasOpen)toggle.focus()}});
 document.addEventListener('click',e=>{if(!e.target.closest('.header'))close()});
 language?.addEventListener('toggle',()=>{if(language.open){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}});
 const motion=document.getElementById('motion'),video=document.querySelector('.hero-video'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let enabled=true,visible=true,loaded=false,fallback=false,pending=false,ready=document.readyState==='complete';
 try{enabled=localStorage.getItem('vastasia-motion')!=='off'}catch{}
 const allowed=()=>enabled&&!reduced.matches&&!navigator.connection?.saveData;
 const sync=async()=>{motion.checked=enabled&&!reduced.matches;motion.disabled=reduced.matches;if(!video)return;if(!ready||!allowed()||!visible||document.hidden){video.pause();if(!allowed())video.classList.remove('is-playing');return}if(pending)return;if(!loaded){video.muted=true;video.defaultMuted=true;video.src=fallback?video.dataset.webm:(innerWidth<=760?video.dataset.mobile:video.dataset.mp4);loaded=true}pending=true;try{await video.play();if(!allowed()||!visible||document.hidden)video.pause()}catch{video.classList.remove('is-playing')}finally{pending=false}};
 motion?.addEventListener('change',()=>{enabled=motion.checked;try{localStorage.setItem('vastasia-motion',enabled?'on':'off')}catch{}sync()});
 reduced.addEventListener('change',sync);navigator.connection?.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',sync);
 if(video){video.addEventListener('playing',()=>{const show=()=>{if(allowed()&&!video.paused&&video.readyState>=2)video.classList.add('is-playing')};if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(show);else requestAnimationFrame(show)});video.addEventListener('error',()=>{video.classList.remove('is-playing');if(!fallback){fallback=true;loaded=false;sync()}});new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync()},{threshold:.05}).observe(video.closest('.hero'));}
 if(ready)sync();else window.addEventListener('load',()=>{ready=true;sync()},{once:true});
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-project-type]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.projectType!==button.dataset.filter})}));
 document.querySelector('[data-load-map]')?.addEventListener('click',e=>{const box=e.currentTarget.closest('[data-map-src]'),frame=document.createElement('iframe');frame.title=box.dataset.mapTitle;frame.src=box.dataset.mapSrc;frame.loading='lazy';frame.referrerPolicy='no-referrer-when-downgrade';frame.allowFullscreen=true;box.replaceChildren(frame)});
 const form=document.getElementById('enquiry');if(form){const status=document.getElementById('form-status'),output=document.getElementById('prepared-message');
 const serviceIndex=['electrical','plumbing','hvac','coordination'].indexOf(params.get('service'));
 if(serviceIndex>=0){form.querySelector('select').selectedIndex=serviceIndex+1;document.querySelectorAll('[data-lang]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('service',params.get('service'));a.href=u.href})}
 const compose=()=>{const lines=[...form.querySelectorAll('.form-grid input,.form-grid select,.form-grid textarea')].map(input=>`${input.closest('label').childNodes[0].textContent.trim()}: ${input.value.trim()}`);const body=`VASTASIA — ${form.querySelector('select').value}\n\n${lines.join('\n\n')}`;output.value=body;output.hidden=false;return body};
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const body=compose();status.textContent=form.dataset.ready;const target=`mailto:office@vastasia.ro?subject=${encodeURIComponent('VASTASIA — '+form.querySelector('select').value)}&body=${encodeURIComponent(body)}`;location.href=target});
 form.querySelector('[data-copy]').addEventListener('click',async()=>{if(!form.reportValidity())return;const body=compose();try{await navigator.clipboard.writeText(body);status.textContent=form.dataset.copied}catch{status.textContent=form.dataset.copyFailed;output.focus();output.select()}});
 }
})();
