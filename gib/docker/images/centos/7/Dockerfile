FROM brokertron/centos:7
MAINTAINER Castedo Ellerman <castedo@castedo.com>

RUN yum install -y gib gibui
RUN yum install -y nmap-ncat

# 4001 = IB API
# 18080 = Brokertron Web API
EXPOSE 4001 18080

COPY config.json /etc/gib/config.json

COPY enter-gateway /root/enter-gateway
ENTRYPOINT ["/root/enter-gateway"]

