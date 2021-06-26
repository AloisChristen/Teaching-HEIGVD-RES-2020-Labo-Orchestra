FROM node:14.17
LABEL authors="Alois CHRISTEN, Delphine SCHERLER"

#
# When we build the image, we copy the sources in the image file system. 
#
COPY src /opt/app/

RUN npm install

CMD ["node", "/opt/app/auditor.js"]