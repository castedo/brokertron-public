FROM brokertron/centos:7
MAINTAINER Castedo Ellerman <castedo@castedo.com>

RUN yum install -y nmap-ncat
RUN yum install -y gib gibui

EXPOSE 18080

EXPOSE 4002
ENV OPENIBAPIPORT 4002

COPY gibd-docker gibd-docker-daemons /

CMD ["/gibd-docker"]

