-- Meta CAPI signals: fbc, fbp, fbclid for improved match rates
alter table events add column if not exists fbc text;
alter table events add column if not exists fbp text;
alter table events add column if not exists fbclid text;
