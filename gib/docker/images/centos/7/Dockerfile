FROM brokertron/centos:7
MAINTAINER Castedo Ellerman <castedo@castedo.com>

RUN yum install -y supervisor
RUN yum install -y tigervnc-server-minimal
RUN yum install -y nmap-ncat
RUN yum install -y gib gibui

# 4001 = IB API
# 5900 = VNC
# 18080 = Brokertron Web API
EXPOSE 4001 5900 18080

COPY supervisord.conf /etc/supervisord.conf

COPY config.json /etc/gib/config.json

# set an empty VNC password
RUN echo | vncpasswd -f > /var/lib/gib/vnc-passwd

COPY enter-gateway /root/enter-gateway
ENTRYPOINT ["/root/enter-gateway"]

