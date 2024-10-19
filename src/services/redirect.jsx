import TYPE from "../constants/TYPE";

const getRedirectPath = (user, getCaisse) => {
  const role = user?.type;

  if (!role) return '/';

  if (role === TYPE.admin) {
    return "/ad";
  } else if (role === TYPE.agent) {
    const caisse = getCaisse();
    return caisse ? "/ag" : "/ag/select-caisse";
  }

  return "/";
};

export default getRedirectPath;
