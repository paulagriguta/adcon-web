% Identificarea transformarii unui semnal
% domeniul de timp (discret)
t=-6.28:0.01:6.28;
% semnalul initial
x=cos(sin(t).*t*10);
x1=cos(sin(t-1).*(t-1)*10);
x2=cos(sin(t-2).*(t-2)*10);
% semnalul obtinut prin transformarea celui initial:
% xt(t)=2*x(t)+3*x(t-1)+4*x(t-2) 
xt=3*x1+2*x+4*x2;
%vizualizarea celor doua semnale: initial (rosu), transformat (albastru)

plot(t,x,'r',t,xt,'b')
% construirea unei retele liniare care sa detecteze dependenta dintre cele doua semnale
ret=newlin([-1 1],1,[0,1],0.1);
% construirea setului de antrenare (transformarea vectorului linie in tablou de celule)
in=con2seq(x); d=con2seq(xt);
% antrenarea retelei
[reta,y,err]=adapt(ret,in,d);
% vizualizarea semnalului dorit, a raspunsului retelei si a erorii
plot(t,cat(2,y{:}),'r',t,xt,'b',t,cat(2,err{:}),'g');