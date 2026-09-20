"""Range-gated link model + weighted relay utility."""
import math


def link_up(a, b, net):
    dx = float(a.get("x", 0)) - float(b.get("x", 0))
    dy = float(a.get("y", 0)) - float(b.get("y", 0))
    return math.hypot(dx, dy) <= float(net.get("range_m", 30))


def utility(reliability, gain, uncertainty, cost, w=None):
    w = w or {"r": 1.0, "i": 1.0, "u": 1.0, "b": 1.0}
    if "reliability" in w:  # accept long-form keys too
        w = {"r": w["reliability"], "i": w["gain"], "u": w["uncertainty"], "b": w["cost"]}
    return w["r"] * reliability + w["i"] * gain + w["u"] * uncertainty - w["b"] * cost
