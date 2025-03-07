FROM ruby:2.7.3-alpine3.13

ARG UID=1001

RUN apk add git yarn build-base postgresql-contrib postgresql-dev \
      bash libcurl curl

RUN apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main/ nodejs=14.17.4-r0 npm

RUN addgroup -g ${UID} -S appgroup && \
  adduser -u ${UID} -S appuser -G appgroup

WORKDIR /app

RUN chown appuser:appgroup /app

ADD --chown=appuser:appgroup https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem ./rds-ca-2019-root.pem
ADD --chown=appuser:appgroup https://s3.amazonaws.com/rds-downloads/rds-ca-2015-root.pem ./rds-ca-2015-root.pem
RUN cat ./rds-ca-2019-root.pem > ./rds-ca-bundle-root.crt
RUN cat ./rds-ca-2015-root.pem >> ./rds-ca-bundle-root.crt
RUN chown appuser:appgroup ./rds-ca-bundle-root.crt

COPY --chown=appuser:appgroup Gemfile Gemfile.lock .ruby-version ./

RUN gem install bundler

RUN bundle config set no-cache 'true'
ARG BUNDLE_ARGS='--jobs 2 --without test development'
RUN bundle install ${BUNDLE_ARGS}

COPY --chown=appuser:appgroup . .

ENV APP_PORT 3000
EXPOSE $APP_PORT

USER ${UID}

ARG RAILS_ENV=production
RUN yarn install --production --check-files
RUN ./bin/webpack
RUN RAILS_ENV=${RAILS_ENV} SECRET_KEY_BASE=$(bin/rake secret) bundle exec rake assets:precompile --trace
CMD bundle exec rake db:migrate && bundle exec rails s -e ${RAILS_ENV} -p ${APP_PORT} --binding=0.0.0.0
