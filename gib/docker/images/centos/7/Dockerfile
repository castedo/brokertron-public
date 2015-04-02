FROM centos:7
MAINTAINER Castedo Ellerman <castedo@castedo.com>

RUN yum update -y \
 && yum install -y epel-release

RUN cd /etc/yum.repos.d/ \
 && curl -O "http://dist.brokertron.com/repo/centos/7/brokertron.repo" \
 && yum install -y nmap-ncat gib gibui

EXPOSE 18080

ENV OPENIBAPIPORT 4002

COPY gibd-docker gibd-docker-daemons /

CMD ["/gibd-docker"]

