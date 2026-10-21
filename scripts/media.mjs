import {spawnSync,spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const ff=process.env.FFMPEG || 'ffmpeg';
const run=(args)=>{const r=spawnSync(ff,['-y','-hide_banner','-loglevel','error',...args],{stdio:'inherit'});if(r.status!==0)throw Error('Media encoding failed');};
for(const name of ['architecture','technical','team']){
 run(['-i',`assets/${name}-source.png`,'-vf','scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900','-c:v','libwebp','-quality','84',`assets/${name}.webp`]);
 run(['-i',`assets/${name}-source.png`,'-vf','scale=800:450:force_original_aspect_ratio=increase,crop=800:450','-c:v','libwebp','-quality','80',`assets/${name}-800.webp`]);
}
run(['-i','assets/logo-source.png','-vf','scale=600:-1','-c:v','libwebp','-quality','90','assets/logo.webp']);
run(['-i','assets/architecture-source.png','-vf','scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630','-q:v','3','assets/social.jpg']);
// 3 still photographs, no synthetic camera shake. Smooth baked crossfades end on the first frame.
const ins=['architecture','technical','team','architecture'].flatMap(n=>['-f','image2','-loop','1','-framerate','24','-t','20','-i',`assets/${n}-source.png`]);
const prep=[0,1,2,3].map(i=>`[${i}:v]scale=1600:900,setsar=1,format=yuv420p,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v${i}]`).join(';');
const blend=(start)=>`blend=all_expr='A*(1-min(1,max(0,(T-${start})/2)))+B*min(1,max(0,(T-${start})/2))':shortest=1`;
const filter=prep+`;[v0][v1]${blend(6)}[a];[a][v2]${blend(12)}[b];[b][v3]${blend(18)}[v]`;
run([...ins,'-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-t','20','-an','-c:v','libx264','-preset','fast','-crf','24','-threads','4','-movflags','+faststart','assets/hero.mp4']);
run(['-i','assets/hero.mp4','-vf','scale=960:540','-an','-c:v','libx264','-preset','fast','-crf','26','-threads','4','-movflags','+faststart','assets/hero-mobile.mp4']);
run(['-i','assets/hero.mp4','-an','-c:v','libvpx-vp9','-b:v','0','-crf','35','-row-mt','1','-cpu-used','4','-threads','4','assets/hero.webm']);
run(['-i','assets/hero.mp4','-frames:v','1','-c:v','libwebp','-quality','88','assets/hero-poster.webp']);
console.log('Optimised stills, matching poster, MP4 desktop/mobile and WebM ready.');
