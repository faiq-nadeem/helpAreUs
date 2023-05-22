import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Popconfirm, message, InputNumber } from "antd";

import { useDispatch, useSelector } from "react-redux";
import func from "../../../util/helpers/func";
import { useIntl } from "react-intl";

const Default = ({ data }) => {
  const { settings } = useSelector(({ settings }) => settings);
  return (
    <>
      {settings.price_type ? (
        <>
          {settings.price_icon}
          {data.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </>
      ) : (
        <>
          {data.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          {settings.price_icon}
        </>
      )}
    </>
  );
};

export default Default;
